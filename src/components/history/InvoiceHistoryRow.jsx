import { memo, useState } from "react";
import { Printer, Eye, Loader2 } from "lucide-react";
import { formatCurrency } from "@/utils/invoiceUtils";
import { formatInvoiceDate } from "@/utils/historyUtils";

function InvoiceHistoryRow({ invoice, onPrint, onReview }) {
  const [action, setAction] = useState(null);

  const handlePrint = async (e) => {
    e.stopPropagation();
    setAction({ type: "print", id: invoice.id });
    await onPrint(invoice.id);
    setAction(null);
  };

  const handleReview = async (e) => {
    e.stopPropagation();
    setAction({ type: "review", id: invoice.id });
    await onReview(invoice.id);
    setAction(null);
  };

  const isLoading = (type) => action?.type === type && action?.id === invoice.id;

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-white p-3 transition hover:border-blue-200 hover:shadow-sm sm:gap-4 sm:p-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-black">
            {invoice.documentType || "Invoice"}: {invoice.documentType === "Quotation" ? "QT-" : "INV-"}{invoice.documentNumber || "-"}
          </span>
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
            {invoice.currency?.code || ""}
          </span>
        </div>
        <p className="mt-0.5 truncate text-sm font-medium text-gray-800 italic">
          {invoice.customer || "—"}
        </p>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          <span>Date: {formatInvoiceDate(invoice.invoiceDate)}</span>
          <span>Created: {formatInvoiceDate(invoice.createdAt)}</span>
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-1">
        <span className="mr-1 text-sm font-semibold text-gray-900">
          {invoice.currency?.symbol || ""} {formatCurrency(invoice.total)}
        </span>
        <button
          onClick={handleReview}
          disabled={isLoading("review")}
          title="Review"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
        >
          {isLoading("review") ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
        <button
          onClick={handlePrint}
          disabled={isLoading("print")}
          title="Print"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
        >
          {isLoading("print") ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Printer className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

export default memo(InvoiceHistoryRow);
