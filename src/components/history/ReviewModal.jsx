import { formatCurrency, calculateItemRow } from "@/utils/invoiceUtils";
import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ReviewModalHeader from "./ReviewModalHeader";
import ReviewCustomerInfo from "./ReviewCustomerInfo";

export default function ReviewModal({ data, onClose }) {
  const { invoice, items, totals } = data;

  const symbol = invoice.currency?.symbol || "";

  const {
    totalContractValue,
    completedMilestoneValue,
    currentMilestoneValue,
    pendingMilestoneValue,
  } = useMemo(() => {
    const total = items.reduce(
      (sum, item) => sum + calculateItemRow(item).netTotal,
      0,
    );
    const completed = items
      .filter((item) => item.status === "Completed")
      .reduce((sum, item) => sum + calculateItemRow(item).netTotal, 0);
    const current = items
      .filter((item) => item.status === "Current")
      .reduce((sum, item) => sum + calculateItemRow(item).netTotal, 0);
    const pending = items
      .filter((item) => item.status === "Pending")
      .reduce((sum, item) => sum + calculateItemRow(item).netTotal, 0);
    return {
      totalContractValue: total,
      completedMilestoneValue: completed,
      currentMilestoneValue: current,
      pendingMilestoneValue: pending,
    };
  }, [items]);

  const discountAmount = totals.discountAmount || 0;
  const taxAmount = totals.taxAmount || 0;

  const netContractTotal = totals.total;
  const adjustmentRatio =
    totalContractValue > 0 ? netContractTotal / totalContractValue : 1;
  const dueThisInvoice = currentMilestoneValue * adjustmentRatio;
  const remaining = pendingMilestoneValue * adjustmentRatio;

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
        className="mx-4 flex max-h-[85vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-2xl overflow-hidden"
      >
        <ReviewModalHeader invoice={invoice} onClose={onClose} />

        <div className="flex-1 overflow-y-auto px-6 py-4">
        <ReviewCustomerInfo invoice={invoice} />
          <div className="rounded-lg border mt-5">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-1/2">Description</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-center">Unit</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Discount</TableHead>
                  {invoice.contractType === "Milestones" && (
                    <TableHead className="text-center">Status</TableHead>
                  )}
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, i) => {
                  const { discountAmount, netTotal } = calculateItemRow(item);
                  return (
                    <TableRow key={item.id || i} className="hover:bg-transparent">
                      <TableCell className="max-w-md align-top">
                        <p className="font-semibold text-gray-900">
                          {item.product || "—"}
                        </p>
                        {item.description && (
                          <p className="mt-2 text-sm leading-6 text-gray-500 whitespace-pre-wrap break-words overflow-wrap-anywhere">
                            {item.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.qty || 0}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.unit || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {symbol} {formatCurrency(item.rate)}
                      </TableCell>
                      <TableCell className="text-right">
                        {discountAmount > 0
                          ? `-${symbol} ${formatCurrency(discountAmount)}`
                          : "-"}
                      </TableCell>
                      {invoice.contractType === "Milestones" && (
                        <TableCell className="text-center">
                          {item.status || "Pending"}
                        </TableCell>
                      )}
                      <TableCell className="text-right font-medium">
                        {symbol} {formatCurrency(netTotal)}
                      </TableCell>
                    </TableRow>
                  );
                })}
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
                {Number(totals.itemDiscountsTotal) > 0 && (
                  <div className="flex justify-between">
                    <span>Item Discounts</span>
                    <span className="tabular-nums">
                      −<span className="text-xs mr-0.5">{symbol}</span>
                      {formatCurrency(totals.itemDiscountsTotal)}
                    </span>
                  </div>
                )}
                {Number(discountAmount) > 0 && (
                  <div className="flex justify-between">
                    <span>Invoice Discount ({discountLabel})</span>
                    <span className="tabular-nums">
                      −<span className="text-xs mr-0.5">{symbol}</span>
                      {formatCurrency(discountAmount)}
                    </span>
                  </div>
                )}
                {Number(taxAmount) > 0 && (
                  <div className="flex justify-between">
                    <span>Tax ({taxLabel})</span>
                    <span className="tabular-nums">
                      +<span className="text-xs mr-0.5">{symbol}</span>
                      {formatCurrency(taxAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 pt-1.5 border-t border-dashed border-slate-300">
                  <span>Net Contract Value</span>
                  <span className="tabular-nums">
                    <span className="text-xs text-slate-400 mr-0.5">{symbol}</span>
                    {formatCurrency(netContractTotal)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 pt-1.5">
                  <span>Amount Due This Invoice</span>
                  <span className="tabular-nums">
                    <span className="text-xs text-slate-400 mr-0.5">{symbol}</span>
                    {formatCurrency(dueThisInvoice)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Remaining Balance</span>
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
                {Number(totals.itemDiscountsTotal) > 0 && (
                  <>
                    <div className="flex justify-between text-gray-600">
                      <span>Item Discounts</span>
                      <span className="font-medium">
                        − {symbol} {formatCurrency(totals.itemDiscountsTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal After Items</span>
                      <span className="font-medium">
                        {symbol} {formatCurrency(totals.subtotal - totals.itemDiscountsTotal)}
                      </span>
                    </div>
                  </>
                )}
                {Number(discountAmount) > 0 && (
                  <div className="flex justify-between">
                    <span>Invoice Discount ({discountLabel})</span>
                    <span className="font-medium">
                      − {symbol} {formatCurrency(discountAmount)}
                    </span>
                  </div>
                )}
                {Number(taxAmount) > 0 && (
                  <div className="flex justify-between">
                    <span>Tax ({taxLabel})</span>
                    <span className="font-medium">
                      + {symbol} {formatCurrency(taxAmount)}
                    </span>
                  </div>
                )}
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
