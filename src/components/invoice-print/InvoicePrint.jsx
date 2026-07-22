import InvoicePrintPage from "./InvoicePrintPage";

const ITEMS_PER_PAGE = 10;
const FIRST_PAGE_ITEMS = 7;

function buildPages(items) {
  if (items.length === 0) return [[]];

  const pages = [];
  let idx = 0;

  const firstCount = Math.min(FIRST_PAGE_ITEMS, items.length);
  pages.push(items.slice(idx, idx + firstCount));
  idx += firstCount;

  while (idx < items.length) {
    const count = Math.min(ITEMS_PER_PAGE, items.length - idx);
    pages.push(items.slice(idx, idx + count));
    idx += count;
  }

  return pages;
}

const InvoicePrint = ({
  invoice,
  items,
  subtotal,
  total,
  balanceDue,
  taxAmount,
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
            isFirstPage={index === 0}
            isLastPage={index === pageChunks.length - 1}
            subtotal={subtotal}
            total={total}
            balanceDue={balanceDue}
            taxAmount={taxAmount}
          />
        </div>
      ))}
    </div>
  );
};

export default InvoicePrint;
