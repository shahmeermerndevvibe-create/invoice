import { GripVertical, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

import { useInvoiceStore } from "@/store/invoiceStore";
import { formatCurrency } from "@/utils/invoiceUtils";

export default function InvoiceItemRow({ index, item }) {
  const updateItem = useInvoiceStore((state) => state.updateItem);

  const deleteItem = useInvoiceStore((state) => state.deleteItem);
  const errors = useInvoiceStore((state) => state.errors);
  const clearItemError = useInvoiceStore((state) => state.clearItemError);
  const rowErrors = errors.itemErrors?.[index] || {};

  const handleChange = (field, value) => {
    updateItem(index, field, value);
    clearItemError(index, field);
  };

  const tdClass = "border border-gray-200 p-2 align-middle";

  return (
    <tr className="hover:bg-gray-50">
      <td className={`${tdClass} w-10 text-center`}>
        <GripVertical size={16} className="mx-auto cursor-move text-gray-400" />
      </td>

      <td className={`${tdClass} w-10 text-right font-medium`}>{index + 1}</td>

      <td className={tdClass}>
        <Input
          type="date"
          value={item.serviceDate}
          onChange={(e) => handleChange("serviceDate", e.target.value)}
          className="border-0 shadow-none focus-visible:ring-0"
        />
        {rowErrors.serviceDate && (
          <p className="mt-1 text-xs text-red-500">{rowErrors.serviceDate}</p>
        )}
      </td>

      <td className={tdClass}>
        <Input
          placeholder="Product"
          value={item.product}
          onChange={(e) => handleChange("product", e.target.value)}
          className="border-0 shadow-none focus-visible:ring-0"
        />
        {rowErrors.product && (
          <p className="mt-1 text-xs text-red-500">{rowErrors.product}</p>
        )}
      </td>

      <td className={tdClass}>
        <Input
          placeholder="Description"
          value={item.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="border-0 shadow-none focus-visible:ring-0"
        />
      </td>

      <td className={`${tdClass} w-20`}>
        <Input
          type="number"
          placeholder="0"
          value={item.qty === 0 ? "" : item.qty}
          onChange={(e) =>
            handleChange(
              "qty",
              e.target.value === "" ? 0 : Number(e.target.value),
            )
          }
          className="border-0 text-right shadow-none focus-visible:ring-0"
        />
        {rowErrors.qty && (
          <p className="mt-1 text-xs text-red-500">{rowErrors.qty}</p>
        )}
      </td>

      <td className={`${tdClass} w-28`}>
        <Input
          type="number"
          placeholder="0"
          value={item.rate === 0 ? "" : item.rate}
          onChange={(e) =>
            handleChange(
              "rate",
              e.target.value === "" ? 0 : Number(e.target.value),
            )
          }
          className="border-0 text-right shadow-none focus-visible:ring-0"
        />
        {rowErrors.rate && (
          <p className="mt-1 text-xs text-red-500">{rowErrors.rate}</p>
        )}
      </td>

      <td className={`${tdClass} w-32 text-right font-medium`}>
        {formatCurrency(item.qty * item.rate)}
      </td>

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
