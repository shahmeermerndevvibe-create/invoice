import { X } from "lucide-react";
import { formatInvoiceDate } from "@/utils/historyUtils";

export default function ReviewModalHeader({ invoice, onClose }) {
  return (
    <div className="flex items-start justify-between border-b px-6 py-4 shrink-0">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          {invoice.documentType || "Invoice"}{" "}
          {invoice.documentType === "Quotation" ? "QT-" : "INV-"}
          {invoice.documentNumber || "-"}
        </h2>
        <p className="mt-0.5 text-sm text-gray-500">
          {invoice.customer || "—"} ·{" "}
          {formatInvoiceDate(invoice.invoiceDate)}
        </p>
        {invoice.contractType === "Milestones" && (
          <span className="mt-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
            Milestone
          </span>
        )}
      </div>
      <button
        onClick={onClose}
        className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
