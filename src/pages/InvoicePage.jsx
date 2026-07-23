import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

import InvoiceHeader from "@/components/invoice/InvoiceHeader";
import CustomerSection from "@/components/invoice/CustomerSection";
import InvoiceItemsTable from "@/components/invoice/InvoiceItemsTable";
import InvoicePrint from "@/components/invoice-print/InvoicePrint";
import InvoiceHistoryPanel from "@/components/history/InvoiceHistoryPanel";
import { useInvoiceStore } from "@/store/invoiceStore";
import { useInvoiceTotals } from "@/hooks/useInvoiceTotals";

const InvoicePage = () => {
  const printRef = useRef(null);

  const invoice = useInvoiceStore((state) => state.invoice);
const items = useInvoiceStore((state) => state.items);
const { subtotal, total, balanceDue, taxAmount, discountAmount } = useInvoiceTotals();

  const printTitle = invoice.documentType === "Quotation" ? "Quotation" : "Invoice";

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: printTitle,
  }); 


  return (
    <>
      <InvoiceHeader />
      <CustomerSection />

      <InvoiceItemsTable onPrint={handlePrint} />

      {/* Hidden printable invoice */}
      <div className="hidden">
        <div ref={printRef}>
          <InvoicePrint 
          invoice={invoice}
          items={items}
          subtotal={subtotal}
          total={total}
          balanceDue={balanceDue}
          taxAmount={taxAmount}
          discountAmount={discountAmount}
          />
        </div>
      </div>

      <InvoiceHistoryPanel />
    </>
  );
};

export default InvoicePage;