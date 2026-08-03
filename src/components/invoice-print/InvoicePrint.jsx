import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Logo from "./Logo";
import TopBanner from "./TopBanner";
import BillingInfo from "./BillingInfo";
import BillingTable from "./BillingTable";
import BillingSummary from "./BillingSummary";
import BillingFooter from "./BillingFooter";

const MM_PX = 96 / 25.4;
const PAGE_H = Math.round(297 * MM_PX);
const FOOTER_H = Math.round(60 * MM_PX);
const SAFE_PX = 8;

function buildPagesFromMeasurements(items, contentHeight, headerHeight, billingInfoHeight, rowHeights, tableOverhead, summaryHeight, notesHeight) {
  if (items.length === 0) return [[]];

  const totalItemHeight = rowHeights.reduce((a, b) => a + b, 0);
  const allOnOne = headerHeight + billingInfoHeight + totalItemHeight + tableOverhead + summaryHeight + notesHeight;
  if (allOnOne <= contentHeight) return [items];

  // For interior/last pages, the table has `pt-8` (32px) which is not in the first page measurement
  const interiorTableOverhead = tableOverhead + 32;

  const firstBudget = contentHeight - headerHeight - billingInfoHeight - tableOverhead;
  const interiorBudget = contentHeight - headerHeight - interiorTableOverhead;

  const firstLastBudget = firstBudget - summaryHeight - notesHeight;
  const interiorLastBudget = interiorBudget - summaryHeight - notesHeight;

  const pages = [];
  let start = 0;

  while (start < items.length) {
    const isFirstPage = pages.length === 0;
    const currentBudget = isFirstPage ? firstBudget : interiorBudget;
    const currentLastBudget = isFirstPage ? firstLastBudget : interiorLastBudget;

    const remainingItems = items.slice(start);
    const remainingH = rowHeights.slice(start).reduce((a, b) => a + b, 0);

    // 1. Can ALL remaining items fit on this page ALONG with summary and notes?
    if (remainingH <= currentLastBudget) {
      pages.push(remainingItems);
      break;
    }

    // 2. We cannot fit all items + summary + notes on this page.
    // So this page CANNOT be the last page. We fill it up to `currentBudget`.
    const page = [];
    let used = 0;

    while (start < items.length) {
      const h = rowHeights[start];
      
      // Check if adding this item exceeds the page budget
      if (used + h > currentBudget && page.length > 0) {
        break;
      }
      
      page.push(items[start]);
      used += h;
      start++;
    }
    
    // Fallback if a single item is larger than the entire page
    if (page.length === 0) {
      page.push(items[start]);
      start++;
    }
    
    pages.push(page);
  }

  // If the loop finished but the last page cannot actually fit summary/notes,
  // we must append an empty page specifically for them.
  const lastPage = pages[pages.length - 1];
  const lastPageIsFirst = pages.length === 1;
  const actualLastBudget = lastPageIsFirst ? firstLastBudget : interiorLastBudget;
  const lastPageH = rowHeights.slice(items.length - lastPage.length).reduce((a, b) => a + b, 0);

  if (lastPageH > actualLastBudget) {
    pages.push([]);
  }

  return pages;
}

function measureHeights(container) {
  const header = container.querySelector("[data-meas-header]");
  const billingInfo = container.querySelector("[data-meas-billing]");
  const itemsSection = container.querySelector("[data-meas-items]");
  const summary = container.querySelector("[data-meas-summary]");
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
  const summaryHeight = summary?.offsetHeight || 0;
  const notesHeight = notes?.offsetHeight || 0;

  return { headerHeight, billingInfoHeight, rowHeights, tableOverheadH: Math.max(0, tableOverheadH), summaryHeight, notesHeight };
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
        <BillingSummary invoice={invoice} items={allItems || items} subtotal={subtotal} total={total} balanceDue={balanceDue} taxAmount={taxAmount} discountAmount={discountAmount} itemDiscountsTotal={itemDiscountsTotal} notesPosition="bottom" />
      </div>
      <div data-meas-notes>
        <div className="px-8 pb-4 md:px-14">
          <h3 className="mb-2 text-sm font-bold text-[#0A4A95]">Note:</h3>
          <div className="text-slate-700 text-xs [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2" dangerouslySetInnerHTML={{ __html: invoice.notes || "<p>No notes available.</p>" }} />
        </div>
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
}) => {
  const [pageChunks, setPageChunks] = useState(null);
  const measRef = useRef(null);

  useLayoutEffect(() => {
    if (!measRef.current) return;

    const root = measRef.current;
    const m = measureHeights(root);
    const contentHeight = PAGE_H - FOOTER_H - SAFE_PX;

    const chunks = buildPagesFromMeasurements(
      items, contentHeight,
      m.headerHeight, m.billingInfoHeight,
      m.rowHeights, m.tableOverheadH,
      m.summaryHeight, m.notesHeight,
    );
    setPageChunks(chunks);
  }, [items]);

  const pages = pageChunks || [items];

  return (
    <>
      {pages.map((chunk, index) => (
        <div
          key={index}
          style={index > 0 ? { pageBreakBefore: "always" } : undefined}
        >
          <BillingTableSection
            invoice={invoice}
            items={chunk}
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
          <BillingTable items={items} invoice={invoice} />
        </div>
      )}

      {isLastPage && (
        <>
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
              notesPosition="bottom"
            />
          </div>
          <div className="min-h-0 flex-1" />
          <div className="shrink-0 px-8 pb-4 md:px-14">
            <h3 className="mb-2 text-sm font-bold text-[#0A4A95]">Note:</h3>
            <div
              className="text-slate-700 text-xs [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2"
              dangerouslySetInnerHTML={{
                __html: invoice.notes || "<p>No notes available.</p>",
              }}
            />
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div className="absolute -bottom-7 left-9 pb-16 z-30">
          <span className="text-xs text-black font-semibold">
            Page {pageNumber} of {totalPages}
          </span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 w-full">
        <BillingFooter hideContact={isFirstPage && !isLastPage} hideThankYou={!isLastPage} invoice={invoice} />
      </div>
    </div>
  );
};

export default InvoicePrint;
