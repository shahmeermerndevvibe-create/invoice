import { X } from "lucide-react";
import { formatCurrency, calculateItemRow } from "@/utils/invoiceUtils";
import { formatInvoiceDate } from "@/utils/historyUtils";
import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ReviewModal({ data, onClose }) {
  const { invoice, items, totals } = data;

  const symbol = invoice.currency?.symbol || "";

  const { totalContractValue, completedMilestoneValue } = useMemo(() => {
    const total = items.reduce(
      (sum, item) => sum + calculateItemRow(item).netTotal,
      0,
    );
    const completed = items
      .filter((item) => item.status === "Completed")
      .reduce((sum, item) => sum + calculateItemRow(item).netTotal, 0);
    return { totalContractValue: total, completedMilestoneValue: completed };
  }, [items]);

  const completionRatio =
    totalContractValue > 0 ? completedMilestoneValue / totalContractValue : 0;

  const discountAmount = totals.discountAmount || 0;
  const taxAmount = totals.taxAmount || 0;

  const contractAfterDiscount = totalContractValue - discountAmount;
  const netContractTotal = contractAfterDiscount + taxAmount;

  const invoiceDiscount = discountAmount * completionRatio;
  const invoiceAfterDiscount = completedMilestoneValue - invoiceDiscount;
  const invoiceTax = taxAmount * completionRatio;
  const dueThisInvoice = invoiceAfterDiscount + invoiceTax;
  const remaining = netContractTotal - dueThisInvoice;

  const discountLabel =
    invoice.discountType === "percent"
      ? `${invoice.discount}%`
      : `${symbol} ${formatCurrency(invoice.discount)}`;

  const taxLabel =
    invoice.taxType === "percent"
      ? `${invoice.tax}%`
      : `${symbol} ${formatCurrency(invoice.tax)}`;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-4 flex max-h-[85vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {invoice.documentType || "Invoice"} {invoice.documentType === "Quotation" ? "QT-" : "INV-"}{invoice.documentNumber || "-"}
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {invoice.customer || "—"} ·{" "}
              {formatInvoiceDate(invoice.invoiceDate)}
            </p>
            {invoice.contractType === "Milestones" && (
              <span className="mt-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                Milestone #{invoice.milestoneNumber}
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

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-1/2">Description</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  {invoice.contractType === "Milestones" && (
                    <TableHead className="text-center">Status</TableHead>
                  )}
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
                    {invoice.contractType === "Milestones" && (
                      <TableCell className="text-center">
                        {item.status || "Pending"}
                      </TableCell>
                    )}
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
            {invoice.contractType === "Milestones" ? (
              <div className="rounded-lg border bg-slate-50 p-4 text-sm space-y-2.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Contract Summary
                </p>

                <div className="flex justify-between">
                  <span>Total Contract Value</span>
                  <span className="font-medium tabular-nums">
                    <span className="text-xs text-slate-400 mr-0.5">{symbol}</span>
                    {formatCurrency(totalContractValue)}
                  </span>
                </div>

                {invoice.discount ? (
                  <div className="flex justify-between text-red-600">
                    <span>Discount ({discountLabel})</span>
                    <span className="tabular-nums">
                      −<span className="text-xs mr-0.5">{symbol}</span>
                      {formatCurrency(discountAmount)}
                    </span>
                  </div>
                ) : null}

                {invoice.tax ? (
                  <div className="flex justify-between text-green-700">
                    <span>Tax ({taxLabel})</span>
                    <span className="tabular-nums">
                      +<span className="text-xs mr-0.5">{symbol}</span>
                      {formatCurrency(taxAmount)}
                    </span>
                  </div>
                ) : null}

                <div className="flex justify-between font-bold text-gray-900 pt-1.5 border-t border-dashed border-slate-300">
                  <span>Net Contract Total</span>
                  <span className="tabular-nums">
                    <span className="text-xs text-slate-400 mr-0.5">{symbol}</span>
                    {formatCurrency(netContractTotal)}
                  </span>
                </div>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-300" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-slate-50 px-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Current Invoice
                    </span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span>Completed Milestones Value</span>
                  <span className="font-medium tabular-nums">
                    <span className="text-xs text-slate-400 mr-0.5">{symbol}</span>
                    {formatCurrency(completedMilestoneValue)}
                  </span>
                </div>

                {invoice.discount ? (
                  <div className="flex justify-between text-red-600">
                    <span>Discount ({discountLabel})</span>
                    <span className="tabular-nums">
                      −<span className="text-xs mr-0.5">{symbol}</span>
                      {formatCurrency(invoiceDiscount)}
                    </span>
                  </div>
                ) : null}

                {invoice.tax ? (
                  <div className="flex justify-between text-green-700">
                    <span>Tax ({taxLabel})</span>
                    <span className="tabular-nums">
                      +<span className="text-xs mr-0.5">{symbol}</span>
                      {formatCurrency(invoiceTax)}
                    </span>
                  </div>
                ) : null}

                <div className="flex justify-between font-bold text-gray-900 pt-1.5 border-t border-dashed border-slate-300">
                  <span>Due This Invoice</span>
                  <span className="tabular-nums">
                    <span className="text-xs text-slate-400 mr-0.5">{symbol}</span>
                    {formatCurrency(dueThisInvoice)}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-slate-500">
                  <span>Remaining (To Be Paid)</span>
                  <span className="tabular-nums">
                    <span className="text-xs mr-0.5">{symbol}</span>
                    {formatCurrency(remaining)}
                  </span>
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
