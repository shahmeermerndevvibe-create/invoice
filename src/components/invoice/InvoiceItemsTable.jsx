import InvoiceItemRow from "./InvoiceItemRow";
import ActionButtons from "@/components/invoice/ActionButtons";
import InvoiceSummary from "@/components/invoice/InvoiceSummary";
import NoteEditor from "@/components/invoice/NoteEditor";
import { useState } from "react";

import { useInvoiceStore } from "@/store/invoiceStore";

export default function InvoiceItemsTable({ onPrint }) {
  const [html, setHtml] = useState("<p>Enter your notes here...</p>");

  const items = useInvoiceStore((state) => state.items);
  const addItem = useInvoiceStore((state) => state.addItem);
  const clearItems = useInvoiceStore((state) => state.clearItems);

  const thClass =
    "border border-gray-200 bg-gray-50 px-3 py-3 text-left text-sm font-semibold whitespace-nowrap";

  return (
    <div className="overflow-x-auto rounded-lg bg-white p-5">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={thClass}></th>
            <th className={`${thClass} w-10 text-right`}>#</th>
            <th className={thClass}>Service Date</th>
            <th className={thClass}>Product / Service</th>
            <th className={`${thClass} w-64`}>Description</th>
            <th className={`${thClass} text-right`}>Qty</th>
            <th className={`${thClass} text-right`}>Rate</th>
            <th className={`${thClass} text-right`}>Amount</th>
            <th className={thClass}></th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => (
            <InvoiceItemRow key={index} index={index} item={item} />
          ))}
        </tbody>
      </table>

      <div className="mt-5 flex flex-col items-end gap-3 items-start lg:flex-row lg:justify-between">
        <ActionButtons onAddRow={addItem} onClearAllRows={clearItems} />
      </div>

      <div className="mt-6 flex flex-col justify-between gap-8 lg:flex-row border-t border-gray-200 pt-6">
        <div className="flex-1">
          <h3 className="mb-3 text-lg font-semibold text-gray-800">
            Message on Invoice
          </h3>
          <NoteEditor />
        </div>

        <InvoiceSummary onPrint={onPrint} />
      </div>
    </div>
  );
}
