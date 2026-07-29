import { useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";

import InvoiceHeader from "@/components/invoice/InvoiceHeader";
import CustomerSection from "@/components/invoice/CustomerSection";
import InvoiceItemsTable from "@/components/invoice/InvoiceItemsTable";
import InvoicePrint from "@/components/invoice-print/InvoicePrint";
import InvoiceHistoryPanel from "@/components/history/InvoiceHistoryPanel";
import ProcessingDialog from "@/components/common/ProcessingDialog";
import { useInvoiceStore } from "@/store/invoiceStore";
import { useInvoiceTotals } from "@/hooks/useInvoiceTotals";
import { useSettingsStore } from "@/store/settingsStore";

const InvoicePage = () => {
  const printRef = useRef(null);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const settingsLoaded = useSettingsStore((s) => s.loaded);
  const processing = useInvoiceStore((s) => s.processing);

  useEffect(() => {
    if (!settingsLoaded) loadSettings();
  }, [settingsLoaded, loadSettings]);

  const invoice = useInvoiceStore((state) => state.invoice);
const items = useInvoiceStore((state) => state.items);
const { subtotal, total, balanceDue, taxAmount, discountAmount, itemDiscountsTotal } = useInvoiceTotals();

  const printTitle = invoice.documentType === "Quotation" ? "Quotation" : "Invoice";

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: printTitle,
  }); 


  return (
    <>
      <ProcessingDialog processing={processing} />
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
          itemDiscountsTotal={itemDiscountsTotal}
          />
        </div>
      </div>

      <InvoiceHistoryPanel />
    </>
  );
};

export default InvoicePage;