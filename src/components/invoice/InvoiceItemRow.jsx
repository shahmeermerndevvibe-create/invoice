import { GripVertical, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInvoiceStore } from "@/store/invoiceStore";
import { formatCurrency, calculateItemRow } from "@/utils/invoiceUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ChevronDown, Circle } from "lucide-react";

export default function InvoiceItemRow({ index, item }) {
  const updateItem = useInvoiceStore((state) => state.updateItem);
  const deleteItem = useInvoiceStore((state) => state.deleteItem);
  const errors = useInvoiceStore((state) => state.errors);
  const clearItemError = useInvoiceStore((state) => state.clearItemError);
  const invoice = useInvoiceStore((state) => state.invoice);

  const itemErrors = errors.itemErrors?.[index] || {};
  const { netTotal } = calculateItemRow(item);

  const handleChange = (field, value) => {
    updateItem(index, field, value);

    if (itemErrors[field]) {
      clearItemError(index, field);
    }
  };

  const tdClass = "border border-gray-200 p-2 align-top";
  const lineTotal = (Number(item.qty) || 0) * (Number(item.rate) || 0);

  const statuses = {
    Pending: {
      color: "text-amber-500",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    Current: {
      color: "text-blue-500",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    Completed: {
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
  };

  return (
    <tr className="hover:bg-gray-50">
      {/* Drag */}
      <td className={`${tdClass} w-10 text-center`}>
        <GripVertical size={16} className="mx-auto cursor-move text-gray-400" />
      </td>

      {/* Sr No */}
      <td className={`${tdClass} w-10 text-right font-medium`}>{index + 1}</td>

      {/* Title */}
      <td className={tdClass}>
        <Input
          placeholder="Title"
          value={item.product}
          onChange={(e) => handleChange("product", e.target.value)}
          className={`border-0 shadow-none focus-visible:ring-0 ${
            itemErrors.product ? "ring-1 ring-red-500" : ""
          }`}
        />

        {itemErrors.product && (
          <p className="mt-1 text-xs text-red-500">{itemErrors.product}</p>
        )}
      </td>

      {/* Description */}
      <td className={tdClass}>
        <div className="space-y-1">
          <textarea
            rows={3}
            maxLength={200}
            placeholder="Enter description..."
            value={item.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="
        min-h-[90px]
        w-full
        resize-y
        rounded-md
        border
        border-gray-200
        bg-white
        p-3
        text-sm
        text-gray-700
        placeholder:text-gray-400
        outline-none
        transition-all
        focus:border-blue-500
        focus:ring-2
        focus:ring-blue-500/20
      "
          />

          <div className="flex justify-end">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors ${
                item.description.length >= 190
                  ? "bg-red-100 text-red-700"
                  : item.description.length >= 160
                    ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-gray-500"
              }`}
            >
              {200 - item.description.length} characters left
            </span>
          </div>
        </div>
      </td>

      {/* Unit Price */}
      <td className={`${tdClass} min-w-[140px]`}>
        <Input
          type="number"
          min={1}
          max={9999999}
          placeholder="0"
          value={item.rate === 0 ? "" : item.rate}
          onChange={(e) => {
            const value = e.target.value;

            handleChange(
              "rate",
              value === "" ? 0 : Math.min(9999999, Number(value)),
            );
          }}
          className={`h-9 rounded-md border bg-white text-right shadow-sm transition-colors
  focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20
  ${
    itemErrors.rate
      ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20"
      : "border-gray-200 hover:border-gray-300"
  }`}
        />

        {itemErrors.rate && (
          <p className="mt-1 text-xs text-red-500">{itemErrors.rate}</p>
        )}
      </td>

      {/* Quantity */}
      <td className={`${tdClass} min-w-[100px]`}>
        <Input
          type="number"
          min={1}
          max={9999999}
          step={1}
          placeholder="0"
          value={item.qty === 0 ? "" : item.qty}
          onChange={(e) => {
            const value = e.target.value;

            handleChange(
              "qty",
              value === "" ? 0 : Math.min(9999999, Number(value)),
            );
          }}
          className={`h-9 rounded-md border bg-white text-right shadow-sm transition-colors
  focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20
  ${
    itemErrors.qty
      ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20"
      : "border-gray-200 hover:border-gray-300"
  }`}
        />

        {itemErrors.qty && (
          <p className="mt-1 text-xs text-red-500">{itemErrors.qty}</p>
        )}
      </td>

      {/* Service Discount */}
      <td className={`${tdClass} min-w-[160px] align-top`}>
        <div className="space-y-2">
          {/* Discount Value */}
          <Input
            type="number"
            min={0}
            max={
              lineTotal === 0
                ? 0
                : item.discountType === "percent"
                  ? 100
                  : lineTotal
            }
            placeholder="0"
            value={item.discount === 0 ? "" : item.discount}
            onChange={(e) => {
              const value = e.target.value;

              if (value === "") {
                handleChange("discount", 0);
                return;
              }

              let num = Number(value);

              if (num < 0) num = 0;

              if (lineTotal === 0) {
                num = 0;
              } else if (item.discountType === "percent") {
                num = Math.min(num, 100);
              } else {
                num = Math.min(num, lineTotal);
              }

              handleChange("discount", num);
            }}
            className={`h-10 text-right font-medium shadow-none ${
              itemErrors.discount
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }`}
          />

          {/* Type Selector */}
          <Select
            value={item.discountType}
            onValueChange={(value) => {
              updateItem(index, "discountType", value);
              updateItem(index, "discount", 0);
            }}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="percent">%</SelectItem>
              <SelectItem value="fixed">{invoice.currency.code}</SelectItem>
            </SelectContent>
          </Select>

          {/* Helper / Error */}
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">
              {item.discountType === "percent"
                ? "0–100%"
                : `Max ${invoice.currency.symbol}${lineTotal.toLocaleString()}`}
            </span>

            {itemErrors.discount && (
              <span className="font-medium text-red-500">
                {itemErrors.discount}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Status — only for Milestones */}
      {invoice.contractType === "Milestones" && (
        <td className={`${tdClass} min-w-[180px]`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex h-10 w-full items-center justify-between rounded-lg border px-3 transition hover:shadow-sm
        ${statuses[item.status].bg}
        ${statuses[item.status].border}`}
              >
                <div className="flex items-center gap-2">
                  <Circle
                    className={`h-3 w-3 fill-current ${statuses[item.status].color}`}
                  />

                  <span className="font-medium">{item.status}</span>
                </div>

                <ChevronDown className="h-4 w-4 opacity-60" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-[180px]">
              {Object.keys(statuses).map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleChange("status", status)}
                >
                  <Circle
                    className={`mr-2 h-3 w-3 fill-current ${statuses[status].color}`}
                  />

                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      )}

      {/* Total */}
      <td className={`${tdClass} min-w-[170px]`}>
        <div className="flex h-9 items-center justify-end rounded-md border border-gray-200 bg-gray-50 px-3 font-semibold text-gray-900 shadow-sm">
          {formatCurrency(netTotal)}
        </div>
      </td>

      {/* Delete */}
      <td className={`${tdClass} w-12 text-center`}>
        <Trash2
          size={18}
          className="mx-auto cursor-pointer text-red-500 transition hover:text-red-600"
          onClick={() => deleteItem(index)}
        />
      </td>
    </tr>
  );
}
