import { X } from "lucide-react";
import { formatCurrency } from "@/utils/invoiceUtils";
import { formatInvoiceDate } from "@/utils/historyUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ReviewModal({ data, onClose }) {
  console.log(data);
  const { invoice, items, totals } = data;

  const symbol = invoice.currency?.symbol || "";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-4 flex max-h-[85vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Invoice {invoice.invoiceNumber || "-"}
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {invoice.customer || "—"} ·{" "}
              {formatInvoiceDate(invoice.invoiceDate)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-1/2">Description</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, i) => (
                  <TableRow key={item.id || i} className="hover:bg-transparent">
                    <TableCell className="max-w-md align-top">
                      <p className="font-semibold text-gray-900">
                        {item.product || "—"}
                      </p>

                      {item.description && (
                        <p
                          className="
        mt-2
        text-sm
        leading-6
        text-gray-500
        whitespace-pre-wrap
        break-words
        overflow-wrap-anywhere
      "
                        >
                          {item.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.qty || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      {symbol} {formatCurrency(item.rate)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {symbol}{" "}
                      {formatCurrency(
                        Number(item.qty || 0) * Number(item.rate || 0),
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 space-y-2.5 border-t pt-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium">
                {symbol} {formatCurrency(totals.subtotal)}
              </span>
            </div>
            {invoice.discount ? (
              <div className="flex justify-between text-red-600">
                <span>
                  Discount (
                  {invoice.discountType === "percent"
                    ? `${invoice.discount}%`
                    : `${symbol} ${invoice.discount}`}
                  )
                </span>
                <span className="font-medium">
                  -{symbol} {formatCurrency(totals.discountAmount)}
                </span>
              </div>
            ) : null}
            {invoice.tax ? (
              <div className="flex justify-between text-amber-600">
                <span>
                  Tax (
                  {invoice.taxType === "percent"
                    ? `${invoice.tax}%`
                    : `${symbol} ${invoice.tax}`}
                  )
                </span>
                <span className="font-medium">
                  {symbol} {formatCurrency(totals.taxAmount)}
                </span>
              </div>
            ) : null}
            <div className="flex justify-between border-t pt-3 text-base font-bold text-gray-900">
              <span>Total</span>
              <span>
                {symbol} {formatCurrency(totals.total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
