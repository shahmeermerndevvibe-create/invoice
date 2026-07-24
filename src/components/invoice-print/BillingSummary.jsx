import { formatCurrency, calculateItemRow } from "@/utils/invoiceUtils";
import { useMemo } from "react";

export default function BillingSummary({
  invoice,
  items = [],
  subtotal,
  total,
  // balanceDue,
  taxAmount,
  discountAmount,
  notesPosition = "inline",
}) {
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

  const contractAfterDiscount = totalContractValue - (discountAmount || 0);
  const netContractTotal = contractAfterDiscount + (taxAmount || 0);

  const invoiceDiscount = (discountAmount || 0) * completionRatio;
  const invoiceAfterDiscount = completedMilestoneValue - invoiceDiscount;
  const invoiceTax = (taxAmount || 0) * completionRatio;
  const dueThisInvoice = invoiceAfterDiscount + invoiceTax;
  const remaining = netContractTotal - dueThisInvoice;

  const discountLabel =
    invoice.discountType === "percent"
      ? `${invoice.discount}%`
      : `${invoice.currency.symbol} ${formatCurrency(invoice.discount)}`;

  const taxLabel =
    invoice.taxType === "percent"
      ? `${invoice.tax}%`
      : `${invoice.currency.symbol} ${formatCurrency(invoice.tax)}`;
  return (
    <section className="totals px-8 py-3 md:px-14">
      <div className="flex justify-between gap-10">
        {notesPosition === "inline" && (
          <div className="md:col-span-7 pt-4">
            <h3 className="mb-4 text-sm font-bold text-[#0A4A95]">Note:</h3>

            <div
              className="
    text-slate-700 text-xs
    ![&_p]:text-xs
    ![&_span]:text-xs
    ![&_li]:text-xs
    ![&_div]:text-xs
    ![&_ul]:list-disc
    [&_ul]:pl-6
    [&_ol]:list-decimal
    [&_ol]:pl-6
    [&_li]:mb-2
  "
              dangerouslySetInnerHTML={{
                __html: invoice.notes || "<p>No notes available.</p>",
              }}
            />
          </div>
        )}

        {/* Totals */}
        <div
          className={
            "md:col-span-5" + (notesPosition !== "inline" ? " ml-auto" : "")
          }
        >
          {invoice.contractType === "Milestones" ? (
            <div className="ml-auto max-w-[280px] space-y-0.5 text-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Contract Summary
              </p>
              <div className="border-t border-black my-1" />

              <div className="flex justify-between">
                <span>Total Contract Value</span>
                <span className="tabular-nums font-medium">
                  <span className="text-xs mr-0.5">
                    {invoice.currency.symbol}
                  </span>
                  {formatCurrency(totalContractValue)}
                </span>
              </div>

              {Number(invoice.discount) > 0 && (
                <div className="flex justify-between text-black">
                  <span>Discount ({discountLabel})</span>
                  <span className="tabular-nums">
                    −
                    <span className="text-xs mr-0.5">
                      {invoice.currency.symbol}
                    </span>
                    {formatCurrency(discountAmount)}
                  </span>
                </div>
              )}

              {/* {Number(invoice.discount) > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span className="pl-3">After Discount</span>
                  <span className="tabular-nums font-medium text-slate-800">
                    <span className="text-xs mr-0.5">
                      {invoice.currency.symbol}
                    </span>
                    {formatCurrency(contractAfterDiscount)}
                  </span>
                </div>
              )} */}

              {Number(invoice.tax) > 0 && (
                <div className="flex justify-between text-black">
                  <span>Tax ({taxLabel})</span>
                  <span className="tabular-nums">
                    +
                    <span className="text-xs mr-0.5">
                      {invoice.currency.symbol}
                    </span>
                    {formatCurrency(taxAmount)}
                  </span>
                </div>
              )}

              <div className="border-t border-black my-1" />
              <div className="flex justify-between font-bold text-gray-900">
                <span>Net Contract Total</span>
                <span className="tabular-nums">
                  <span className="text-xs mr-0.5">
                    {invoice.currency.symbol}
                  </span>
                  {formatCurrency(netContractTotal)}
                </span>
              </div>

              <div className="border-t-2 border-double border-slate-400 my-3" />

              <div className="flex justify-between">
                <span>Completed Value</span>
                <span className="tabular-nums font-medium">
                  <span className="text-xs mr-0.5">
                    {invoice.currency.symbol}
                  </span>
                  {formatCurrency(completedMilestoneValue)}
                </span>
              </div>

              {Number(invoice.discount) > 0 && (
                <div className="flex justify-between text-black">
                  <span>Discount ({discountLabel})</span>
                  <span className="tabular-nums">
                    −
                    <span className="text-xs mr-0.5">
                      {invoice.currency.symbol}
                    </span>
                    {formatCurrency(invoiceDiscount)}
                  </span>
                </div>
              )}

              {/* {Number(invoice.discount) > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span className="pl-3">After Discount</span>
                  <span className="tabular-nums font-medium text-slate-800">
                    <span className="text-xs mr-0.5">
                      {invoice.currency.symbol}
                    </span>
                    {formatCurrency(invoiceAfterDiscount)}
                  </span>
                </div>
              )} */}

              {Number(invoice.tax) > 0 && (
                <div className="flex justify-between text-black">
                  <span>Tax ({taxLabel})</span>
                  <span className="tabular-nums">
                    +
                    <span className="text-xs mr-0.5">
                      {invoice.currency.symbol}
                    </span>
                    {formatCurrency(invoiceTax)}
                  </span>
                </div>
              )}

              <div className="border-t-2 border-double border-slate-400 my-3" />

              <div className="mt-2 flex justify-between overflow-hidden rounded-md bg-linear-60 from-blue-800 to-blue-500 text-white">
                <div className="flex-1 py-2 pl-4 text-base font-bold">
                  Due This Invoice
                </div>

                <div className="flex items-center justify-center px-4 font-bold">
                  <span className="mr-2 text-xs font-bold">
                    {invoice.currency.symbol}
                  </span>

                  <span className="text-lg">
                    {formatCurrency(dueThisInvoice)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-xs text-slate-500 pt-1">
                <span>Remaining (To Be Paid)</span>
                <span className="tabular-nums">
                  <span className="text-xs mr-0.5">
                    {invoice.currency.symbol}
                  </span>
                  {formatCurrency(remaining)}
                </span>
              </div>
            </div>
          ) : (
            <div className="ml-auto max-w-[280px] space-y-3">
              <div className="flex justify-between text-base font-semibold">
                <span className="font-bold">Sub Total:</span>
                <span>
                  <span className="ml-1 text-sm font-normal pr-2 text-black font-extrabold">
                    {invoice.currency.symbol}
                  </span>
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-base font-semibold">
                <span className="font-bold">Tax:</span>
                <span className="flex items-center gap-1">
                  {invoice.taxType === "fixed" && (
                    <span className="text-sm font-normal text-black">
                      {invoice.currency.symbol}
                    </span>
                  )}
                  {formatCurrency(invoice.tax)}
                  {invoice.taxType === "percent" && (
                    <span className="text-sm font-normal text-black">%</span>
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-semibold">
                <span className="font-bold">Discount:</span>
                <span className="flex items-center gap-1">
                  {invoice.discountType === "fixed" && (
                    <span className="text-sm font-normal text-black">
                      {invoice.currency.symbol}
                    </span>
                  )}
                  {formatCurrency(invoice.discount)}
                  {invoice.discountType === "percent" && (
                    <span className="text-sm font-normal text-black">%</span>
                  )}
                </span>
              </div>

              <div className="mt-5 flex justify-between text-white bg-linear-60 from-blue-800 to-blue-500 overflow-hidden rounded-md">
                <div className="flex-1 pl-4 py-2 text-white font-bold text-lg">
                  Total Cost:
                </div>
                <div className="flex items-center justify-center whitespace-nowrap px-4 font-bold text-white">
                  <span className="mr-2 shrink-0 text-sm font-extrabold">
                    {invoice.currency.symbol}
                  </span>
                  <span className="min-w-0 truncate text-base sm:text-lg md:text-xl">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
