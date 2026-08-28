import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Logo from "./Logo";
import TopBanner from "./TopBanner";
import BillingInfo from "./BillingInfo";
import BillingTable from "./BillingTable";
import BillingSummary from "./BillingSummary";
import MilestoneSummary from "./MilestoneSummary";
import BillingFooter from "./BillingFooter";

const showMilestoneSummary = (invoice) =>
  invoice?.contractType === "Milestones" &&
  invoice?.documentType === "Invoice";

const isMilestoneContract = (invoice) =>
  invoice?.contractType === "Milestones";

const MM_PX = 96 / 25.4;
const PAGE_H = Math.round(297 * MM_PX);
const FOOTER_H = Math.round(60 * MM_PX);
const SAFE_PX = 8;

function buildPagesFromMeasurements(items, contentHeight, headerHeight, billingInfoHeight, rowHeights, tableOverhead, bsHeight, msOverhead, msRowHeights, msFooterHeight, notesHeight, isMilestone) {
  const msRowsTotal = msRowHeights.reduce((a, b) => a + b, 0);
  const summaryBlockH = bsHeight + msOverhead + msRowsTotal + msFooterHeight;
  const hasMs = msRowHeights.length > 0;

  if (items.length === 0) {
    return [{ items: [], showBillingSummary: true, msStart: 0, msEnd: msRowHeights.length }];
  }

  const totalItemHeight = rowHeights.reduce((a, b) => a + b, 0);
  const allOnOne = headerHeight + billingInfoHeight + totalItemHeight + tableOverhead + summaryBlockH + notesHeight;
  if (allOnOne <= contentHeight) {
    return [{ items, showBillingSummary: true, msStart: 0, msEnd: msRowHeights.length }];
  }

  // For interior/last pages, the table has `pt-8` (32px) which is not in the first page measurement
  const interiorTableOverhead = tableOverhead + 32;

  const firstBudget = contentHeight - headerHeight - billingInfoHeight - tableOverhead;
  const interiorBudget = contentHeight - headerHeight - interiorTableOverhead;

  // Items pages: greedy forward fill. The summary flows on its own pages after
  // the items, so pages only need to fit their items.
  const pages = [];
  let start = 0;

  while (start < items.length) {
    const isFirstPage = pages.length === 0;
    const currentBudget = isFirstPage ? firstBudget : interiorBudget;

    const remainingH = rowHeights.slice(start).reduce((a, b) => a + b, 0);

    if (remainingH <= currentBudget) {
      pages.push(items.slice(start));
      break;
    }

    const page = [];
    let used = 0;

    while (start < items.length) {
      const h = rowHeights[start];

      if (used + h > currentBudget && page.length > 0) {
        break;
      }

      page.push(items[start]);
      used += h;
      start++;
    }

    if (page.length === 0) {
      page.push(items[start]);
      start++;
    }

    pages.push(page);
  }

  // The summary intro (totals + milestone header + first milestone row) must be
  // able to start right below the last table. If the last items page is too
  // full for it, peel the trailing items onto a new final page so the summary
  // can begin underneath the table on that page.
  //
  // Only peel the single-page case: when the items already span multiple pages
  // the summary can simply continue onto its own following page, so trailing
  // items are never disturbed. Milestone contracts never peel either — their
  // totals block flows forward onto its own pages.
  const introReserve = bsHeight + msOverhead + (hasMs ? msRowHeights[0] : 0);
  let lastItems = pages[pages.length - 1];
  const lastIsFirst = pages.length === 1;
  let lastBudget = lastIsFirst ? firstBudget : interiorBudget;
  // `pages` hold item objects; row heights are keyed by position in `items`.
  const sumRows = (list) =>
    list.reduce((acc, item) => acc + rowHeights[items.indexOf(item)], 0);
  let lastItemsH = sumRows(lastItems);

  if (
    !isMilestone &&
    lastIsFirst &&
    lastItemsH > lastBudget - introReserve &&
    lastItems.length > 1
  ) {
    const peeled = [];
    while (lastItemsH > lastBudget - introReserve && lastItems.length > 1) {
      peeled.unshift(lastItems.pop());
      lastItemsH = sumRows(lastItems);
    }
    pages.push(peeled);
    lastItemsH = sumRows(peeled);
    // The fresh final page is no longer the first page, so it budgets like an
    // interior page (header + table only, no billing info). Without this,
    // `lastFree` is understated and the summaries are wrongly classified as
    // unable to fit below the table.
    lastBudget = interiorBudget;
  }

  // Build the summary flow from the last items page onward.
  const chunks = pages.map((p) => ({
    items: p,
    showBillingSummary: false,
    msStart: null,
    msEnd: null,
  }));
  const lastChunk = chunks[chunks.length - 1];
  const lastFree = lastBudget - lastItemsH;

  let msFrom = 0;

  const canStartMs = hasMs && lastFree >= bsHeight + msOverhead + msRowHeights[0];
  const canFitBs = lastFree >= bsHeight;

  if (canStartMs) {
    let rowsH = 0;
    let rows = 0;
    const room = lastFree - bsHeight - msOverhead;

    while (
      rows < msRowHeights.length &&
      rowsH + msRowHeights[rows] + (rows + 1 === msRowHeights.length ? msFooterHeight : 0) <= room
    ) {
      rowsH += msRowHeights[rows];
      rows++;
    }

    if (rows > 0) {
      lastChunk.showBillingSummary = true;
      lastChunk.msStart = 0;
      lastChunk.msEnd = rows;
      msFrom = rows;
    } else if (canFitBs) {
      lastChunk.showBillingSummary = true;
    }
  } else if (canFitBs) {
    lastChunk.showBillingSummary = true;
  }

  // If there is no milestone summary to carry the totals block (fixed
  // contracts) and the table fills the final page with no room for it, emit
  // the billing summary on its own dedicated page so it is never dropped.
  if (!lastChunk.showBillingSummary && !hasMs) {
    chunks.push({ items: [], showBillingSummary: true, msStart: 0, msEnd: 0 });
  }

  // Flow the remaining milestone rows forward. The last milestone page also
  // carries the footer (due box). Reserve that final tail first so a page that
  // turns out to be the last never ends up over-full with the footer.
  let firstFresh = !lastChunk.showBillingSummary;
  while (msFrom < msRowHeights.length) {
    const baseCap = Math.max(
      0,
      interiorBudget - (firstFresh ? bsHeight : 0) - msOverhead,
    );

    // Earliest index `s` such that the tail rows from s..end plus the footer
    // still fit on a single page. That tail becomes the last milestone page.
    let s = msRowHeights.length;
    let tailH = 0;
    for (let i = msRowHeights.length - 1; i >= msFrom; i--) {
      if (tailH + msRowHeights[i] + msFooterHeight <= baseCap) {
        tailH += msRowHeights[i];
        s = i;
      } else {
        break;
      }
    }

    const isLastMsPage = s === msFrom;
    const cap = Math.max(0, isLastMsPage ? baseCap - msFooterHeight : baseCap);
    // Non-final pages may fill up to the last row (the final page then holds
    // the last row plus footer); any tail that starts at or after `s` still
    // fits with the footer, so packing past `s` stays safe.
    const limit = isLastMsPage
      ? msRowHeights.length
      : Math.max(msFrom + 1, msRowHeights.length - 1);

    let rowsH = 0;
    let rows = 0;
    while (
      msFrom + rows < limit &&
      rowsH + msRowHeights[msFrom + rows] <= cap
    ) {
      rowsH += msRowHeights[msFrom + rows];
      rows++;
    }
    if (rows === 0) rows = 1;

    chunks.push({
      items: [],
      showBillingSummary: firstFresh,
      msStart: msFrom,
      msEnd: msFrom + rows,
    });
    firstFresh = false;
    msFrom += rows;
  }

  return chunks;
}

function measureHeights(container) {
  const header = container.querySelector("[data-meas-header]");
  const billingInfo = container.querySelector("[data-meas-billing]");
  const itemsSection = container.querySelector("[data-meas-items]");
  const notes = container.querySelector("[data-meas-notes]");

  const headerHeight = header?.offsetHeight || 0;
  const billingInfoHeight = billingInfo?.offsetHeight || 0;
  const totalItemsHeight = itemsSection?.offsetHeight || 0;
  const table = itemsSection?.querySelector("table") || itemsSection?.querySelector("[role='table']");
  const tbody = table?.querySelector("tbody") || table?.querySelector("[role='rowgroup']");
  const rowElements = tbody?.querySelectorAll(":scope > tr, :scope > [role='row']") || [];
  const rowHeights = Array.from(rowElements).map((el) => el.offsetHeight);
  const rowSum = rowHeights.reduce((a, b) => a + b, 0);
  const tableOverheadH = totalItemsHeight - rowSum;
  const notesHeight = notes?.offsetHeight || 0;

  const bsNode = container.querySelector("[data-meas-bs]");
  const msNode = container.querySelector("[data-meas-ms]");
  const bsHeight = bsNode?.offsetHeight || 0;

  let msOverheadH = 0;
  let msRowHeights = [];
  let msFooterH = 0;
  if (msNode) {
    const msSectionH = msNode.offsetHeight;
    const msTable = msNode.querySelector("table");
    const msTbody = msTable?.querySelector("tbody") || msTable?.querySelector("[role='rowgroup']");
    const msRowEls = msTbody?.querySelectorAll(":scope > tr, :scope > [role='row']") || [];
    msRowHeights = Array.from(msRowEls).map((el) => el.offsetHeight);
    const msFooter = msNode.querySelector("[data-ms-footer]");
    msFooterH = msFooter?.offsetHeight || 0;
    const msRowsSum = msRowHeights.reduce((a, b) => a + b, 0);
    msOverheadH = Math.max(0, msSectionH - msRowsSum - msFooterH);
  }

  return {
    headerHeight,
    billingInfoHeight,
    rowHeights,
    tableOverheadH: Math.max(0, tableOverheadH),
    bsHeight,
    msOverheadH,
    msRowHeights,
    msFooterH,
    notesHeight,
  };
}

function renderMeasureNodes(invoice, items, allItems, subtotal, total, balanceDue, taxAmount, discountAmount, itemDiscountsTotal) {
  return (
    <>
      <div data-meas-header>
        <div className="print-header relative shrink-0">
          <div className="relative flex items-start justify-between border-b border-slate-900 px-12 pt-8 pb-2">
            <Logo invoice={invoice} />
            <TopBanner invoice={invoice} />
          </div>
          <div className="border-b border-slate-900" />
        </div>
      </div>
      <div data-meas-billing>
        <BillingInfo invoice={invoice} />
      </div>
      <div data-meas-items>
        <BillingTable items={items} invoice={invoice} />
      </div>
      <div data-meas-summary>
        <div data-meas-bs>
          <BillingSummary invoice={invoice} items={allItems || items} subtotal={subtotal} total={total} balanceDue={balanceDue} taxAmount={taxAmount} discountAmount={discountAmount} itemDiscountsTotal={itemDiscountsTotal} notesPosition="inline" />
        </div>
        {showMilestoneSummary(invoice) && (
          <div data-meas-ms>
            <MilestoneSummary invoice={invoice} items={allItems || items} />
          </div>
        )}
      </div>
    </>
  );
}

const MEAS_STYLE = {
  position: "fixed",
  left: "-9999px",
  top: 0,
  width: Math.round(210 * MM_PX) + "px",
  pointerEvents: "none",
  opacity: 0.01,
};

const InvoicePrint = ({
  invoice,
  items,
  allItems,
  subtotal,
  total,
  balanceDue,
  taxAmount,
  discountAmount,
  itemDiscountsTotal,
  onReady,
}) => {
  const [pageChunks, setPageChunks] = useState(null);
  const measRef = useRef(null);
  const fontsLoaded = useRef(false);

  useLayoutEffect(() => {
    if (!measRef.current) return;

    let cancelled = false;
    let imagesLoading = 0;
    let fontsReady = false;
    fontsLoaded.current = false;

    const measure = () => {
      if (cancelled || !measRef.current) return;
      if (!(fontsLoaded.current && imagesLoading <= 0)) return;
      const root = measRef.current;
      const m = measureHeights(root);
      const contentHeight = PAGE_H - FOOTER_H - SAFE_PX;

      const chunks = buildPagesFromMeasurements(
        items, contentHeight,
        m.headerHeight, m.billingInfoHeight,
        m.rowHeights, m.tableOverheadH,
        m.bsHeight, m.msOverheadH, m.msRowHeights, m.msFooterH,
        m.notesHeight, isMilestoneContract(invoice),
      );
      setPageChunks(chunks);
    };

    const onAssetReady = () => {
      imagesLoading -= 1;
      if (imagesLoading <= 0 && fontsReady) measure();
    };

    // Track image loading
    measRef.current.querySelectorAll("img").forEach((img) => {
      if (img.complete) return;
      imagesLoading += 1;
      img.addEventListener("load", onAssetReady, { once: true });
      img.addEventListener("error", onAssetReady, { once: true });
    });

    // Track font loading
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        fontsReady = true;
        fontsLoaded.current = true;
        if (!cancelled && imagesLoading <= 0) measure();
      });
    } else {
      fontsReady = true;
      fontsLoaded.current = true;
    }

    // Observe for any subsequent layout changes (font swap, dynamic content, etc.)
    const observer = new ResizeObserver(() => {
      if (!cancelled) measure();
    });
    observer.observe(measRef.current);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [items, invoice, onReady]);

  // Signal readiness only after the paginated DOM has been committed by React.
  // `useLayoutEffect` runs after DOM mutation, so `onReady` can never fire while
  // the print node still shows the single-chunk fallback.
  useLayoutEffect(() => {
    if (pageChunks !== null) onReady?.();
  }, [pageChunks, onReady]);

  const pages = pageChunks || [
    { items, showBillingSummary: true, msStart: 0, msEnd: null },
  ];

  // Milestone numbering continues across pages: each page's table starts at
  // the cumulative count of items on the pages before it.
  let running = 0;
  const pageStarts = pages.map((p) => {
    const start = running;
    running += p.items.length;
    return start;
  });

  return (
    <>
      {pages.map((chunk, index) => (
        <div
          key={index}
          style={index > 0 ? { pageBreakBefore: "always" } : undefined}
        >
          <BillingTableSection
            invoice={invoice}
            items={chunk.items}
            startIndex={pageStarts[index]}
            showBillingSummary={chunk.showBillingSummary}
            msStart={chunk.msStart}
            msEnd={chunk.msEnd}
            allItems={allItems || items}
            isFirstPage={index === 0}
            isLastPage={index === pages.length - 1}
            pageNumber={index + 1}
            totalPages={pages.length}
            subtotal={subtotal}
            total={total}
            balanceDue={balanceDue}
            taxAmount={taxAmount}
            discountAmount={discountAmount}
            itemDiscountsTotal={itemDiscountsTotal}
          />
        </div>
      ))}
      {createPortal(
        <div ref={measRef} style={MEAS_STYLE}>
          {renderMeasureNodes(invoice, items, allItems, subtotal, total, balanceDue, taxAmount, discountAmount, itemDiscountsTotal)}
        </div>,
        document.body
      )}
    </>
  );
};

const BillingTableSection = ({
  invoice,
  items,
  startIndex = 0,
  showBillingSummary,
  msStart,
  msEnd,
  allItems,
  isFirstPage,
  isLastPage,
  pageNumber,
  totalPages,
  subtotal,
  total,
  balanceDue,
  taxAmount,
  discountAmount,
  itemDiscountsTotal,
}) => {
  return (
    <div
      className="invoice-page bg-white flex flex-col"
      style={{
        width: "210mm",
        height: "297mm",
        margin: "0 auto",
        background: "white",
        overflow: "hidden",
        position: "relative",
        paddingBottom: "60mm",
      }}
    >
      <header className="print-header relative shrink-0">
        <div className="relative flex items-start justify-between border-b border-slate-900 px-12 pt-8 pb-2">
          <Logo invoice={invoice} />
          <TopBanner invoice={invoice} />
        </div>
        <div className="border-b border-slate-900" />
      </header>

      {isFirstPage && (
        <div className="shrink-0">
          <BillingInfo invoice={invoice} />
        </div>
      )}

      {items.length > 0 && (
        <div className={"shrink-0" + (isFirstPage ? "" : " pt-8")}>
          <BillingTable items={items} invoice={invoice} startIndex={startIndex} />
        </div>
      )}

      {showBillingSummary && (
        <div className={"shrink-0" + (items.length === 0 ? " pt-16" : "")}>
          <BillingSummary
            invoice={invoice}
            items={allItems || items}
            subtotal={subtotal}
            total={total}
            balanceDue={balanceDue}
            taxAmount={taxAmount}
            discountAmount={discountAmount}
            itemDiscountsTotal={itemDiscountsTotal}
            notesPosition="inline"
          />
        </div>
      )}

      {showMilestoneSummary(invoice) &&
        msStart !== null &&
        msEnd !== null &&
        msEnd > msStart && (
        <div className="shrink-0">
          <MilestoneSummary
            invoice={invoice}
            items={allItems || items}
            startIndex={msStart}
            endIndex={msEnd}
            showFooter={isLastPage}
          />
        </div>
      )}

      {totalPages > 1 && (
        <div className="absolute bottom-1 left-5 z-30">
          <span className="text-xs text-black font-semibold">
            Page {pageNumber} of {totalPages}
          </span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 w-full">
        <BillingFooter isLastPage={isLastPage} invoice={invoice} />
      </div>
    </div>
  );
};

export default InvoicePrint;
