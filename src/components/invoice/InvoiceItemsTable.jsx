import { useState, useCallback } from "react";
import InvoiceItemRow from "./InvoiceItemRow";
import ActionButtons from "@/components/invoice/ActionButtons";
import InvoiceSummary from "@/components/invoice/InvoiceSummary";
import NoteEditor from "@/components/invoice/NoteEditor";

import { useInvoiceStore } from "@/store/invoiceStore";
import PaymentEditior from "./PaymentEditior";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency, calculateItemRow } from "@/utils/invoiceUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Circle } from "lucide-react";

const statuses = {
  Pending: { color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-300" },
  Current: { color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-300" },
  Completed: { color: "text-green-700", bg: "bg-green-100", border: "border-green-300" },
};

function MobileItemCard({ index, item, invoice }) {
  const updateItem = useInvoiceStore((s) => s.updateItem);
  const deleteItem = useInvoiceStore((s) => s.deleteItem);
  const errors = useInvoiceStore((s) => s.errors);
  const clearItemError = useInvoiceStore((s) => s.clearItemError);
  const itemErrors = errors.itemErrors?.[index] || {};
  const { netTotal } = calculateItemRow(item);

  const handleChange = (field, value) => {
    updateItem(index, field, value);
    if (itemErrors[field]) clearItemError(index, field);
  };

  return (
    <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500"># {index + 1}</span>
        <Trash2
          size={16}
          className="cursor-pointer text-red-500 transition hover:text-red-600"
          onClick={() => deleteItem(index)}
        />
      </div>

      <textarea
        rows={2}
        placeholder="Title"
        value={item.product}
        onChange={(e) => handleChange("product", e.target.value)}
        className="w-full resize-y rounded-md border border-gray-200 bg-white p-2 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />
      {itemErrors.product && <p className="text-xs text-red-500">{itemErrors.product}</p>}

      <textarea
        rows={2}
        maxLength={200}
        placeholder="Enter description..."
        value={item.description}
        onChange={(e) => handleChange("description", e.target.value)}
        className="min-h-[60px] w-full resize-y rounded-md border border-gray-200 bg-white p-2 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-500">Unit Price</label>
          <Input
            type="number"
            min={1}
            max={9999999}
            placeholder="0"
            value={item.rate === 0 ? "" : item.rate}
            onChange={(e) => {
              const value = e.target.value;
              handleChange("rate", value === "" ? 0 : Math.min(9999999, Number(value)));
            }}
            className="h-9 text-right"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-500">Quantity</label>
          <Input
            type="number"
            min={1}
            max={9999999}
            placeholder="0"
            value={item.qty === 0 ? "" : item.qty}
            onChange={(e) => {
              const value = e.target.value;
              handleChange("qty", value === "" ? 0 : Math.min(9999999, Number(value)));
            }}
            className="h-9 text-right"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-500">Total</label>
          <div className="flex h-9 items-center justify-end rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-900">
            {formatCurrency(netTotal)}
          </div>
        </div>
      </div>

      {invoice.contractType === "Milestones" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`flex h-9 w-full items-center justify-between rounded-lg border px-3 transition hover:shadow-sm
                ${statuses[item.status].bg} ${statuses[item.status].border}`}
            >
              <div className="flex items-center gap-2">
                <Circle className={`h-3 w-3 fill-current ${statuses[item.status].color}`} />
                <span className="text-sm font-medium">{item.status}</span>
              </div>
              <ChevronDown className="h-4 w-4 opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[180px]">
            {Object.keys(statuses).map((status) => (
              <DropdownMenuItem key={status} onClick={() => handleChange("status", status)}>
                <Circle className={`mr-2 h-3 w-3 fill-current ${statuses[status].color}`} />
                {status}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

export default function InvoiceItemsTable({ onPrint }) {
  const [html, setHtml] = useState("<p>Enter your notes here...</p>");
  const [dragIndex, setDragIndex] = useState(null);

  const items = useInvoiceStore((state) => state.items);
  const addItem = useInvoiceStore((state) => state.addItem);
  const clearItems = useInvoiceStore((state) => state.clearItems);
  const reorderItems = useInvoiceStore((state) => state.reorderItems);
  const invoice = useInvoiceStore((state) => state.invoice);

  const thClass =
    "border border-gray-200 bg-gray-50 px-3 py-3 text-left text-sm font-semibold whitespace-nowrap";

  const handleDragStart = useCallback((index) => {
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((index) => {
    if (dragIndex === null || dragIndex === index) return;
    reorderItems(dragIndex, index);
    setDragIndex(null);
  }, [dragIndex, items, reorderItems]);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
  }, []);

  return (
    <div className="rounded-lg bg-white p-5">
      {/* Mobile card layout */}
      <div className="space-y-3 md:hidden">
        {items.map((item, index) => (
          <MobileItemCard
            key={`${index}-${invoice.contractType}`}
            index={index}
            item={item}
            invoice={invoice}
          />
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={thClass}></th>
              <th className={`${thClass} w-10 text-right`}>#</th>
              <th className={`${thClass} w-45`}>Title</th>
              <th className={`${thClass} w-84`}>Description</th>
              <th className={`${thClass} w-30 text-right`}>Unit Price</th>
              <th className={`${thClass} w-30 text-right`}>Quantity</th>
              {invoice.contractType === "Milestones" && (
                <th className={`${thClass} w-36 text-center`}>Status</th>
              )}
              <th className={`${thClass} text-right w-45`}>Total</th>
              <th className={thClass}></th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => (
              <InvoiceItemRow
                key={`${index}-${invoice.contractType}`}
                index={index}
                item={item}
                dragIndex={dragIndex}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
              />
            ))}
          </tbody>
        </table>
      </div>

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

         <div className="flex-1">
          <h3 className="mb-3 text-lg font-semibold text-gray-800">
            Payment
          </h3>
          <PaymentEditior />
        </div>

        <InvoiceSummary onPrint={onPrint} />
      </div>
    </div>
  );
}
