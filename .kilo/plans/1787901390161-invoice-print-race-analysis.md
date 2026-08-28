# Invoice Print Pagination Race — Deep Analysis & Fix Plan

## Bug symptom

Printing from the History panel intermittently produces a single page containing **all**
invoice item rows, overlapping the billing info / footer. Retrying the same invoice usually
prints correctly. Production-only.

## Files in the flow

- `src/components/invoice-print/InvoicePrint.jsx` — measurement + `pageChunks` + `onReady`
- `src/components/history/InvoiceHistoryPanel.jsx` — fetch → mount → poll → print
- `src/pages/InvoicePage.jsx` — editor print path (does NOT pass `onReady`; not affected)
- `node_modules/react-to-print` v3.3.0 — iframe clone + print
- `index.html` — Montserrat loaded from Google Fonts (all weights)
- `src/main.jsx` — `<StrictMode>` (dev only)

## Mechanism trace

1. `handlePrintClick` fetches data → `setPrintData(result)` → `InvoicePrint` mounts inside
   `<div className="hidden">` under `printRef`.
2. `InvoicePrint` state `pageChunks` starts `null`. Fallback render:
   `pages = pageChunks || [{ items, showBillingSummary: true, msStart: 0, msEnd: null }]`
   → **all items in one 297mm page** (overflow hidden → content runs under the absolute
   footer → the reported overlap). This is the "wrong" DOM.
3. `useLayoutEffect` sets up image listeners, `document.fonts.ready.then(...)`, and a
   `ResizeObserver` on the measure portal.
4. Every measurement calls:
   ```js
   setPageChunks(chunks);
   if (fontsLoaded.current) onReady?.();
   ```
5. Parent `useEffect` (on `printData`) runs a `requestAnimationFrame` poll + a **1s safety
   timer**. When `printReady.current` is true the poll calls `handlePrintAction()`
   (the `useReactToPrint` callback) and nulls `printData` (unmounting `InvoicePrint`).
6. `useReactToPrint` (v3.3.0) is called with **no `onBeforePrint`/`onBeforeGetContent`**.
   It synchronously does `cloneNode(true)` of `printRef.current` and loads the clone into
   an iframe. The extra `setTimeout(…, 500)` inside react-to-print happens *after* the
   clone, so it cannot rescue stale DOM — the wrong single-page DOM is already captured.

## Answers to the questions

### 1. Most likely root cause

`onReady()` is emitted **synchronously after `setPageChunks()`, before React commits that
state update to the DOM**. `measure()` runs from async contexts (font promise, image event,
ResizeObserver callback). React 18/19 batches updates from non-React contexts and schedules
the commit asynchronously (Scheduler → MessageChannel macrotask, not a microtask). The
parent's `requestAnimationFrame` poll can therefore observe `printReady.current === true`
**before React has re-rendered the print node**, and `handlePrintAction()` clones the DOM
that still shows `pageChunks === null` (single-page fallback).

When the update comes from the `document.fonts.ready.then()` microtask, the commit is a
macrotask that runs **after** the current frame's rendering phase — i.e. after the poll's
RAF in that frame. The poll wins the race and prints stale DOM.

### 2. Is the font/ResizeObserver theory correct?

Partially. The specific claim — "ResizeObserver calls `measure()` before `document.fonts.ready`,
which fires `onReady()` with wrong measurements" — is **not** the operative mechanism, because
`onReady` is guarded by `fontsLoaded.current` (only set after `document.fonts.ready` resolves).
A pre-font ResizeObserver measurement can call `setPageChunks` (interim chunks) but cannot fire
`onReady`.

The real race is **`onReady` being emitted before React commits `pageChunks`**, and it exists
for *every* async `measure()` caller (font promise, image load/error, ResizeObserver). The
font/ResizeObserver interplay only contributes nondeterminism (extra `measure()` calls,
interim commits) and makes the timing of the ready signal variable.

A second, independent defect: the **1s safety timer prints unconditionally** (`if (printRef.current)`)
even when `printReady.current` is false. If fonts/images take longer than 1s (cold production
CDN), the timer prints the un-paginated fallback DOM.

### 3. Why production but not local

- Dev runs `<StrictMode>`: effects mount → cleanup → mount again. The extra full render pass
  gives React an extra commit opportunity and extra timing slack that masks the race.
- Dev bundle is unminified/slower; local fonts/assets are cached or fast.
- Production: single mount pass, faster timing, cold Google Fonts CDN on first attempt →
  the commit-vs-poll ordering is tight and intermittent.

### 4. Why same invoice fails once, then works

- Attempt 1: fonts cold → `document.fonts.ready` resolves late; the poll or (more likely) the
  1s safety timer fires around the same time as the commit → stale single-page DOM captured.
- Attempt 2+: fonts cached → fonts resolve fast, React commits before the poll's next RAF →
  correct multi-page DOM cloned.
- The commit-vs-RAF ordering is a genuine race, so outcomes flip attempt to attempt.

### 5. Is `onReady` after `setPageChunks` safe?

**No.** `setPageChunks` from an async context returns before the DOM is updated (React
schedules the commit). React can absolutely have stale DOM at that moment. The ready signal
must be coupled to a DOM commit, not to a state-setter call.

### 6. What should "print ready" mean?

All of:
- Fonts used by the print DOM loaded (`document.fonts.ready` resolved).
- Images that affect measurement loaded (logo tracked today).
- `pageChunks` computed from **final** metrics (no interim pre-font chunks).
- The `pageChunks` render **committed to the DOM** (React commit for the `printRef` subtree).

The cleanest single observable for the last point is: a React effect keyed on `pageChunks`
that runs after commit.

### 7. Most robust fix (synchronize on readiness, no arbitrary delays)

**Primary (recommended):**
- In `InvoicePrint.jsx`:
  1. Remove `onReady?.()` from inside `measure()`.
  2. In `measure()`, early-return unless assets are final:
     `if (!(fontsLoaded.current && imagesLoading <= 0)) return;` (after the `cancelled` check).
     This guarantees `pageChunks` only ever commits final measurements (interim RO/font
     measurements never reach the DOM).
  3. Add a post-commit ready effect:
     ```js
     useLayoutEffect(() => {
       if (pageChunks !== null) onReady?.();
     }, [pageChunks, onReady]);
     ```
     `useLayoutEffect` runs synchronously after React commits the new `pageChunks` to the
     DOM, so `onReady` fires strictly after the paginated DOM exists. The poll's next RAF
     then clones the correct DOM.
- In `InvoiceHistoryPanel.jsx`:
  4. Make the safety timer **respect readiness**: only print when `printReady.current ===
     true` (and `printRef.current`); otherwise keep waiting (or simply remove the timer —
     the ready signal is now deterministic). A long (e.g. 15s) watchdog that no-ops unless
     ready is acceptable; never print the fallback DOM.

This is deterministic: ready is a function of an actual DOM commit, not of timing.

**Alternative (fallback):** `flushSync(() => setPageChunks(chunks))` inside `measure()` before
`onReady()`. Synchronous commit closes the race, but it forces a synchronous re-render from a
ResizeObserver callback (works, but less idiomatic and can throw if ever invoked during a React
render). Prefer the effect-based fix.

### 8. Could react-to-print clone the DOM before React commits?

**Yes — this is exactly what happens.** `handlePrintAction()` is invoked by the RAF poll the
moment `printReady.current` is true, while the commit of `pageChunks` may still be pending
(scheduled as a macrotask). `useReactToPrint` clones `printRef.current` synchronously
(`cloneNode(true)`), so the stale DOM is captured before react-to-print's own 500ms delay.

### 9. Other contributors (stale refs, mount/unmount, font cache, RO, images, cleanup)

- **Repeated mount/unmount:** each print mounts a fresh `InvoicePrint`; parent refs
  (`printing`, `printReady`) reset at print start and on panel close. Fine.
- **Font cache behavior:** cached fonts → fast `document.fonts.ready` → tight race; cold fonts
  → delayed → often safe. Drives the intermittency.
- **ResizeObserver timing:** extra post-font `measure()` calls (identical chunks → React bails,
  harmless) and pre-font calls (interim `setPageChunks`, no `onReady`). Contributor only.
- **Image loading:** the logo image in the measure node gates measurement. If it is slow, the
  1s safety timer can print the fallback DOM. Contributor via the timer.
- **Cleanup/cancellation:** `cancelled` flag and `observer.disconnect()` are correct.
- **Stale refs:** `fontsLoaded.current` correctly reset each effect run.
- **Dead code:** the initial `if (fontsReady && imagesLoading <= 0) measure();` branch never
  fires in the fonts-exists path (`fontsReady` starts `false`; only set inside `.then`). Not a
  bug, but remove for clarity.
- **Minor:** `BillingFooter.jsx` has a stray `console.log("ıilling Footer", ...)` (typo) that
  should be removed; it fires on every page render.
- **Not in scope:** `buildPagesFromMeasurements` logic is internally consistent; no evidence it
  is wrong. `InvoicePrintPage.jsx` is unused. The editor path (`InvoicePage.jsx`) has no
  `onReady` and prints an already-mounted, already-paginated invoice — not affected.

### 10. Minimal implementation strategy

Files that change:

1. `src/components/invoice-print/InvoicePrint.jsx`
   - `measure()`: drop `onReady?.()`; add final-assets guard before `setPageChunks`.
   - Add post-commit `useLayoutEffect` that fires `onReady?.()` when `pageChunks !== null`.
   - (Optional) remove the dead initial-measure branch.
2. `src/components/history/InvoiceHistoryPanel.jsx`
   - Safety timer: gate on `printReady.current === true` (never print the fallback), extend or
     remove as a watchdog.
   - Keep the RAF poll as-is; it already prints only when ready.
3. (Optional) `src/components/invoice-print/BillingFooter.jsx` — delete stray `console.log`.

No changes to `buildPagesFromMeasurements`, the measure-node markup, or print CSS.

### 11. Edge cases the fix must handle

- Zero-item invoice → commits a summary-only chunk → `onReady` → single summary page.
- Milestone contracts (ms rows spanning pages) and Quotations (no ms) — unchanged logic, still
  committed before ready.
- Long descriptions → tall rows → fewer rows/page — same flow.
- Fonts blocked/slow → `document.fonts.ready` still resolves; fallback metrics are consistent
  between the measure node and the print iframe (both load the same Montserrat stylesheet).
- Logo image slow or erroring → `onAssetReady` still decrements → measurement proceeds.
- Multiple `measure()` calls → identical chunks bail out of the re-render (no re-fire of the
  ready effect); differing chunks re-commit and re-fire `onReady` — parent treats it as
  idempotent (it already printed / `printData` nulled → unmount → cancelled).
- Rapid double-print → `printing.current` guard; poll prints once.
- Panel closed mid-measure → cleanup sets `cancelled`, parent resets refs.
- StrictMode dev double-mount → `cancelled` guard; ready effect fires harmlessly twice.

### 12. Logging/instrumentation that would definitively prove it

Temporary, production build (`npm run build` + preview), timestamps via `performance.now()`:

- `InvoicePrint.measure()`: log `fonts`, `images`, `chunks.length` each call.
- Ready effect: log `[commit] chunks=<n> at=<t>` (proves DOM commit).
- `handlePrintReady`: log `[ready] at=<t>`.
- Parent poll immediately before `handlePrintAction()`: log `[print] pages=<printRef
  querySelectorAll('.invoice-page').length> at=<t>`.
- Safety timer: log `[timer] ready=<printReady.current>` if it fires.
- Also count pages inside the cloned iframe content (react-to-print exposes nothing, so log
  from the poll just before cloning).

**Failing attempt proof:** `[ready]` timestamp < `[commit]` timestamp, and `[print] pages=1`
for a multi-item invoice. **Passing attempt:** `[commit]` before `[ready]`, `[print] pages=N`.
This distinguishes the pre-commit ready race from the safety-timer path (`[timer]` logged with
`ready=false`).

## Confidence

**~80%** that the root cause is the pre-commit `onReady` signal racing the `requestAnimationFrame`
poll (with the unconditional 1s safety timer as a secondary real failure path). The user's
font/ResizeObserver theory is a plausible *symptom variant* but not the primary mechanism; the
`fontsLoaded` guard means pre-font RO measurements cannot fire `onReady`. The instrumented
production reproduction above would raise this to definitive.
