import InvoicePrintPage from "./InvoicePrintPage";

const PAGE_HEIGHT_MM = 297;
const HEADER_MM = 42;
const BILLING_INFO_MM = 48;
const TOTALS_MM = 55;
const NOTES_MM = 30;
const FOOTER_MM = 55;

const CHARS_PER_LINE = 38;
const BASE_ROW_MM = 17;
const DESC_LINE_MM = 6.5;

function estimateRowHeight(item) {
  const desc = item.description || "";
  const descLines = Math.ceil(desc.length / CHARS_PER_LINE);
  return BASE_ROW_MM + descLines * DESC_LINE_MM;
}

function estimateRowsHeight(items) {
  return items.reduce((sum, item) => sum + estimateRowHeight(item), 0);
}

function buildPages(items) {
  if (items.length === 0) return [[]];

  const singleBudget =
    PAGE_HEIGHT_MM - HEADER_MM - BILLING_INFO_MM - TOTALS_MM - NOTES_MM - FOOTER_MM;
  const firstBudget = PAGE_HEIGHT_MM - HEADER_MM - BILLING_INFO_MM - FOOTER_MM;
  const interiorBudget = PAGE_HEIGHT_MM - HEADER_MM - FOOTER_MM;
  const lastBudget = PAGE_HEIGHT_MM - HEADER_MM - TOTALS_MM - NOTES_MM - FOOTER_MM;

  const pages = [];
  let i = 0;

  while (i < items.length) {
    const pageIndex = pages.length;
    const isFirst = pageIndex === 0;

    const remaining = items.slice(i);
    const remainingHeight = estimateRowsHeight(remaining);
    const fitsOnLastPage = remainingHeight <= lastBudget;

    let budget;

    if (isFirst && fitsOnLastPage && remainingHeight <= singleBudget) {
      return [remaining];
    } else if (fitsOnLastPage) {
      budget = isFirst ? singleBudget : lastBudget;
    } else if (isFirst) {
      budget = firstBudget;
    } else {
      budget = interiorBudget;
    }

    const pageItems = [];
    let used = 0;

    while (i < items.length) {
      const h = estimateRowHeight(items[i]);

      if (used + h > budget && pageItems.length > 0) break;

      pageItems.push(items[i]);
      used += h;
      i++;
    }

    pages.push(pageItems);
  }

  return pages;
}

const InvoicePrint = ({
  invoice,
  items,
  allItems,
  subtotal,
  total,
  balanceDue,
  taxAmount,
  discountAmount,
}) => {
  const pageChunks = buildPages(items);

  return (
    <div>
      {pageChunks.map((chunk, index) => (
        <div
          key={index}
          style={index > 0 ? { pageBreakBefore: "always" } : undefined}
        >
          <InvoicePrintPage
            invoice={invoice}
            items={chunk}
            allItems={allItems || items}
            isFirstPage={index === 0}
            isLastPage={index === pageChunks.length - 1}
            subtotal={subtotal}
            total={total}
            balanceDue={balanceDue}
            taxAmount={taxAmount}
            discountAmount={discountAmount}
          />
        </div>
      ))}
    </div>
  );
};

export default InvoicePrint;
