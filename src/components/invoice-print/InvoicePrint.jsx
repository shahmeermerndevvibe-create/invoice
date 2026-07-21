import Logo from "./Logo";
import TopBanner from "./TopBanner";
import BillingInfo from "./BillingInfo";
import BillingTable from "./BillingTable";
import BillingSummary from "./BillingSummary";
import BillingFooter from "./BillingFooter";

const InvoicePrint = ({ invoice, items, subtotal, total, balanceDue, taxAmount }) => {
  return (
    <div className="invoice bg-white flex flex-col" style={{ width: '210mm', height: '296mm', margin: '0 auto', overflow: 'hidden', position: 'relative' }}>
     <header className="print-header relative">
        <div className="relative flex items-start justify-between border-b border-slate-900 px-12 pt-8 pb-8">
          <Logo />
          <TopBanner 
          invoice={invoice}
          />
        </div>

        <div className="border-b border-slate-900" />
      </header>

      <BillingInfo invoice={invoice} />

      <BillingTable items={items} />

      <BillingSummary 
        invoice={invoice} 
        subtotal={subtotal} 
        total={total} 
        balanceDue={balanceDue} 
        taxAmount={taxAmount}
      />

       <div className="absolute bottom-0 left-0 w-full">
        <BillingFooter />
      </div>
    </div>
  );
};

export default InvoicePrint;