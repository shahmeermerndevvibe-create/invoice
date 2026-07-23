import Logo from "./Logo";
import TopBanner from "./TopBanner";
import BillingInfo from "./BillingInfo";
import BillingTable from "./BillingTable";
import BillingSummary from "./BillingSummary";
import BillingFooter from "./BillingFooter";

const InvoicePrintPage = ({
  invoice,
  items,
  allItems,
  isFirstPage,
  isLastPage,
  subtotal,
  total,
  balanceDue,
  taxAmount,
  discountAmount,
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
        paddingBottom: "55mm",
      }}
    >
      <header className="print-header relative shrink-0">
        <div className="relative flex items-start justify-between border-b border-slate-900 px-12 pt-8 pb-8">
          <Logo invoice={invoice} />
          <TopBanner invoice={invoice} />
        </div>
        <div className="border-b border-slate-900" />
      </header>

      {isFirstPage && <div className="shrink-0"><BillingInfo invoice={invoice} /></div>}

      <div className={"shrink-0" + (isFirstPage ? "" : " pt-8")}>
        <BillingTable items={items} invoice={invoice} />
      </div>

      {isLastPage && (
        <>
          <div className="shrink-0">
            <BillingSummary
              invoice={invoice}
              items={allItems || items}
              subtotal={subtotal}
              total={total}
              balanceDue={balanceDue}
              taxAmount={taxAmount}
              discountAmount={discountAmount}
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

      <div className="absolute bottom-0 left-0 w-full">
        <BillingFooter hideContact={isFirstPage && !isLastPage} />
      </div>
    </div>
  );
};

export default InvoicePrintPage;
