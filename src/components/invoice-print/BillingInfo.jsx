import { useEffect, useRef } from "react";
import { formatFirestoreDate } from "@/utils/dateUtils";

const MIN_SECTION_GAP = 4;
const INTERNAL_MARGIN_MIN = 4;

export default function BillingInfo({ invoice = {} }) {
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const invoiceToRef = useRef(null);
  const businessRef = useRef(null);
  const applied = useRef({
    height: "",
    marginA: "",
    marginB: "",
    internalCut: 0,
    baseA: null,
    baseB: null,
    internals: null,
  });

  const hasPayment = Boolean(invoice.payment);

  useEffect(() => {
    const left = leftRef.current;
    const right = rightRef.current;
    const invoiceTo = invoiceToRef.current;
    const business = businessRef.current;

    if (!left || !right || !invoiceTo || !business) {
      const state = applied.current;
      state.internals?.forEach((el) => (el.style.marginBottom = ""));
      applied.current = {
        height: "",
        marginA: "",
        marginB: "",
        internalCut: 0,
        baseA: null,
        baseB: null,
        internals: null,
      };
      if (left) left.style.height = "";
      if (invoiceTo) invoiceTo.style.marginTop = "";
      if (business) business.style.marginTop = "";
      return;
    }

    let rafId = null;

    const update = () => {
      rafId = null;

      const state = applied.current;

      if (state.baseA === null) {
        state.baseA = parseFloat(getComputedStyle(invoiceTo).marginTop) || 32;
      }
      if (state.baseB === null) {
        state.baseB = parseFloat(getComputedStyle(business).marginTop) || 24;
      }
      if (state.internals === null) {
        state.internals = Array.from(left.querySelectorAll(".mb-2"));
      }

      if (state.height) left.style.height = "";
      const naturalLeft = left.getBoundingClientRect().height;
      const rightHeight = right.getBoundingClientRect().height;

      if (!rightHeight && !naturalLeft) return;

      const diff = rightHeight - naturalLeft;

      let height = state.height;
      let marginA = state.marginA;
      let marginB = state.marginB;
      let internalCut = state.internalCut;

      if (diff > 0) {
        height = `${rightHeight}px`;
      } else if (diff < 0) {
        height = "";
        const capA = Math.max(0, state.baseA - MIN_SECTION_GAP);
        const capB = Math.max(0, state.baseB - MIN_SECTION_GAP);
        const secCap = capA + capB;
        const internalCap = state.internals.length * 4;
        const need = Math.min(-diff, secCap + internalCap);
        const secCut = Math.min(need, secCap);
        const totalSecCap = Math.max(1, secCap);
        const cutA = Math.round((secCut * capA) / totalSecCap);
        marginA = `${state.baseA - cutA}px`;
        marginB = `${state.baseB - (secCut - cutA)}px`;
        const internalNeed = need - secCut;
        if (internalNeed > 0 && state.internals.length > 0) {
          internalCut = Math.min(4, internalNeed / state.internals.length);
        }
      }

      const changed =
        height !== state.height ||
        marginA !== state.marginA ||
        marginB !== state.marginB ||
        internalCut !== state.internalCut;

      if (state.height && !changed) {
        left.style.height = state.height;
        return;
      }
      if (!changed) return;

      state.height = height;
      state.marginA = marginA;
      state.marginB = marginB;
      state.internalCut = internalCut;

      left.style.height = height;
      invoiceTo.style.marginTop = marginA;
      business.style.marginTop = marginB;
      state.internals.forEach((el) => {
        el.style.marginBottom = internalCut > 0 ? `${8 - internalCut}px` : "";
      });
    };

    rafId = requestAnimationFrame(update);

    const ro = new ResizeObserver(() => {
      if (rafId === null) rafId = requestAnimationFrame(update);
    });
    ro.observe(left);
    ro.observe(right);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      ro.disconnect();
      const state = applied.current;
      state.internals?.forEach((el) => (el.style.marginBottom = ""));
      left.style.height = "";
      invoiceTo.style.marginTop = "";
      business.style.marginTop = "";
    };
  }, [hasPayment]);

  return (
    <section className="px-8 py-6 md:px-14">
      <div className="flex items-start justify-between gap-8">
        <div
          ref={leftRef}
          className="flex min-w-0 flex-1 flex-col justify-between"
        >
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800">
              Date:
              <span className="ml-2 font-bold pb-15 text-sm normal-case">
                {formatFirestoreDate(invoice.createdAt)}
              </span>
            </h3>
          </div>

          <div>
            <h4
              ref={invoiceToRef}
              className="mt-8 text-sm font-bold uppercase tracking-[3px] text-black"
            >
              Invoice To:
            </h4>

            <h2 className="mb-2 text-4xl font-bold text-slate-900">
              {invoice.businessName || ""}
            </h2>

            <p className="mb-2 text-black font-bold">
              {invoice.businessEmail}
            </p>

            <p className="mb-2 text-black font-medium">
              <span className="font-bold">Phone:</span> {invoice.phoneNo}
            </p>

            <p className="mb-2 text-black font-medium">
              <span className="font-bold">Address:</span>{" "}
              {invoice.billingAddress}
            </p>
          </div>

          <div>
            <h4
              ref={businessRef}
              className="mb-2 mt-6 text-sm font-bold uppercase tracking-[3px] text-black"
            >
              Business:
            </h4>

            <h2 className="mb-2 text-4xl font-bold text-slate-900">
              {invoice.businessName || ""}
            </h2>

            <p className="mb-2 text-black font-bold">
              {invoice.businessEmail}
            </p>

            {/* <p className="text-black font-medium">
            <span className="font-bold">Address:</span>{" "}
            {invoice.businessAddress}
          </p> */}
          </div>
        </div>

        {/* Right */}
        {invoice.payment && (
          <div
            ref={rightRef}
            className="shrink-0 text-right"
          >
            <div className="max-w-[380px]">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-700">
                Payment Information
              </h4>
              {invoice.payment.startsWith("http://") ||
              invoice.payment.startsWith("https://") ? (
                <a
                  href={invoice.payment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 underline hover:text-blue-800"
                >
                  {invoice.payment}
                </a>
              ) : (
                <div
                  className="
    text-sm
    text-slate-600
    // leading-6

    [&_p]:m-0
    [&_p]:mb-1
    [&_p]:break-words

    [&_strong]:font-semibold
    [&_a]:text-blue-600
    [&_a]:underline

    [&_ul]:list-disc
    [&_ul]:pl-5
    [&_ol]:list-decimal
    [&_ol]:pl-5
    [&_li]:mb-1
  "
                  dangerouslySetInnerHTML={{
                    __html: invoice.payment,
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}