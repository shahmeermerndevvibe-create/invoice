import { GripVertical, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useInvoiceStore } from "@/store/invoiceStore";
import { formatCurrency } from "@/utils/invoiceUtils";

export default function InvoiceItemRow({ index, item }) {
  const updateItem = useInvoiceStore((state) => state.updateItem);
  const deleteItem = useInvoiceStore((state) => state.deleteItem);
  const errors = useInvoiceStore((state) => state.errors);
  const clearItemError = useInvoiceStore((state) => state.clearItemError);

  const itemErrors = errors.itemErrors?.[index] || {};

  const handleChange = (field, value) => {
    updateItem(index, field, value);

    if (itemErrors[field]) {
      clearItemError(index, field);
    }
  };

  const tdClass = "border border-gray-200 p-2 align-top";

  return (
    <tr className="hover:bg-gray-50">
      {/* Drag */}
      <td className={`${tdClass} w-10 text-center`}>
        <GripVertical size={16} className="mx-auto cursor-move text-gray-400" />
      </td>

      {/* Sr No */}
      <td className={`${tdClass} w-10 text-right font-medium`}>{index + 1}</td>

      {/* Product */}
      <td className={tdClass}>
        <Input
          placeholder="Product"
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

      {/* Quantity */}
      <td className={`${tdClass} min-w-[100px]`}>
        <Input
          type="number"
          min={1}
          max={99999}
          step={1}
          placeholder="0"
          value={item.qty === 0 ? "" : item.qty}
          onChange={(e) => {
            const value = e.target.value;

            handleChange(
              "qty",
              value === "" ? 0 : Math.min(99999, Number(value)),
            );
          }}
          className={`border-0 text-right shadow-none focus-visible:ring-0 ${
            itemErrors.qty ? "ring-1 ring-red-500" : ""
          }`}
        />

        {itemErrors.qty && (
          <p className="mt-1 text-xs text-red-500">{itemErrors.qty}</p>
        )}
      </td>

      {/* Rate */}
      <td className={`${tdClass} min-w-[140px]`}>
        <Input
          type="number"
          min={1}
          max={99999}
          placeholder="0"
          value={item.rate === 0 ? "" : item.rate}
          onChange={(e) => {
            const value = e.target.value;

            handleChange(
              "rate",
              value === "" ? 0 : Math.min(99999, Number(value)),
            );
          }}
          className={`border-0 text-right shadow-none focus-visible:ring-0 ${
            itemErrors.rate ? "ring-1 ring-red-500" : ""
          }`}
        />

        {itemErrors.rate && (
          <p className="mt-1 text-xs text-red-500">{itemErrors.rate}</p>
        )}
      </td>

      {/* Amount */}
      <td className={`${tdClass} min-w-[170px] text-right font-medium`}>
        {formatCurrency(item.qty * item.rate)}
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
