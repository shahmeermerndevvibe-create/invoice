import { formatCurrency } from "@/utils/invoiceUtils";

export default function BillingSummary({
  invoice,
  subtotal,
  total,
  // balanceDue,
  taxAmount,
  discountAmount,
  itemDiscountsTotal,
  notesPosition = "inline",
}) {
  const afterItemDiscounts = (subtotal || 0) - (itemDiscountsTotal || 0);
  const netContractTotal =
    afterItemDiscounts - (discountAmount || 0) + (taxAmount || 0);

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
      <div className="flex flex-row gap-10">
        {notesPosition === "inline" && (
          <div className="flex-1 pt-4">
            <h3 className="mb-4 text-sm font-bold text-[#0A4A95]">Note:</h3>

            <div
              className="
        text-xs text-slate-700
        [&_p]:text-xs
        [&_span]:text-xs
        [&_li]:text-xs
        [&_div]:text-xs
        [&_ul]:list-disc
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
          className={`w-[320px] shrink-0 ${
            notesPosition !== "inline" ? "ml-auto" : ""
          }`}
        >
          {invoice.contractType === "Milestones" ? (
            invoice.documentType === "Invoice" ? (
              <div className="ml-auto max-w-[280px] space-y-2 pb-4 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="font-bold">Contract Value</span>
                  <span className="tabular-nums font-medium">
                    <span className="text-xs mr-0.5">
                      {invoice.currency.symbol}
                    </span>
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                {Number(itemDiscountsTotal) > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="font-light">Item Discounts</span>
                    <span className="tabular-nums">
                      −
                      <span className="text-xs mr-0.5">
                        {invoice.currency.symbol}
                      </span>
                      {formatCurrency(itemDiscountsTotal)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between gap-3">
                  <span className="font-bold">
                    Contract Value (After Discounts)
                  </span>
                  <span className="tabular-nums font-medium">
                    <span className="text-xs mr-0.5">
                      {invoice.currency.symbol}
                    </span>
                    {formatCurrency(subtotal - itemDiscountsTotal)}
                  </span>
                </div>

                {Number(discountAmount) > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="font-bold">
                      Invoice Discount ({discountLabel})
                    </span>
                    <span className="tabular-nums">
                      −
                      <span className="text-xs mr-0.5">
                        {invoice.currency.symbol}
                      </span>
                      {formatCurrency(discountAmount)}
                    </span>
                  </div>
                )}

                {Number(taxAmount) > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="font-light">Tax ({taxLabel})</span>
                    <span className="tabular-nums">
                      +
                      <span className="text-xs mr-0.5">
                        {invoice.currency.symbol}
                      </span>
                      {formatCurrency(taxAmount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between gap-3 font-bold text-gray-900">
                  <span>Total Contract Value</span>
                  <span className="tabular-nums">
                    <span className="text-xs mr-0.5">
                      {invoice.currency.symbol}
                    </span>
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="ml-auto max-w-[280px] space-y-2 pb-4 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="font-bold">Total Contract Value</span>
                  <span className="tabular-nums font-medium">
                    <span className="text-xs mr-0.5">
                      {invoice.currency.symbol}
                    </span>
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                {Number(itemDiscountsTotal) > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="font-light">Item Discounts</span>
                    <span className="tabular-nums">
                      −
                      <span className="text-xs mr-0.5">
                        {invoice.currency.symbol}
                      </span>
                      {formatCurrency(itemDiscountsTotal)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between gap-3">
                  <span className="font-bold">
                    Contract Value (After Discounts)
                  </span>
                  <span className="tabular-nums font-medium">
                    <span className="text-xs mr-0.5">
                      {invoice.currency.symbol}
                    </span>
                    {formatCurrency(afterItemDiscounts)}
                  </span>
                </div>

                {Number(discountAmount) > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="font-bold">
                      Invoice Discount ({discountLabel})
                    </span>
                    <span className="tabular-nums">
                      −
                      <span className="text-xs mr-0.5">
                        {invoice.currency.symbol}
                      </span>
                      {formatCurrency(discountAmount)}
                    </span>
                  </div>
                )}

                {Number(taxAmount) > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="font-light">Tax ({taxLabel})</span>
                    <span className="tabular-nums">
                      +
                      <span className="text-xs mr-0.5">
                        {invoice.currency.symbol}
                      </span>
                      {formatCurrency(taxAmount)}
                    </span>
                  </div>
                )}

                {/* <div className="border-t border-black my-1" /> */}

                <div className="mt-5 flex justify-between overflow-hidden rounded-md bg-gradient-to-r from-[#1C3C75] from-[5%] to-[#1E90FF] to-[100%] text-white">
                  <div className="flex-1 py-2 pl-4 text-lg font-bold">
                    Total
                  </div>

                  <div className="flex items-center justify-center whitespace-nowrap px-4 font-bold">
                    <span className="mr-2 shrink-0 text-sm font-extrabold">
                      {invoice.currency.symbol}
                    </span>

                    <span className="min-w-0 truncate text-base sm:text-lg md:text-xl">
                      {formatCurrency(netContractTotal)}
                    </span>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="ml-auto max-w-[280px] space-y-3 pb-3">
              <div className="flex justify-between text-base font-semibold">
                <span className="font-bold">Subtotal:</span>
                <span>
                  <span className="ml-1 text-sm font-normal pr-2 text-black font-extrabold">
                    {invoice.currency.symbol}
                  </span>
                  {formatCurrency(subtotal)}
                </span>
              </div>

              {Number(itemDiscountsTotal) > 0 && (
                <>
                  <div className="flex justify-between text-base font-semibold">
                    <span className="font-light">Item Discounts:</span>
                    <span className="text-sm font-normal">
                      −{invoice.currency.symbol}{" "}
                      {formatCurrency(itemDiscountsTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-semibold">
                    <span className="font-bold">
                      Subtotal (After Discount):
                    </span>
                    <span>
                      <span className="ml-1 text-sm font-normal pr-2 text-black font-extrabold">
                        {invoice.currency.symbol}
                      </span>
                      {formatCurrency(subtotal - itemDiscountsTotal)}
                    </span>
                  </div>
                </>
              )}

              {Number(discountAmount) > 0 && (
                <div className="flex justify-between text-base font-semibold">
                  <span className="font-light">
                    Invoice Discount ({discountLabel}):
                  </span>
                  <span className="text-sm font-normal">
                    −{invoice.currency.symbol} {formatCurrency(discountAmount)}
                  </span>
                </div>
              )}

              {Number(taxAmount) > 0 && (
                <div className="flex justify-between text-base">
                  <span className="font-light">Tax ({taxLabel}):</span>
                  <span className="text-sm font-normal">
                    +{invoice.currency.symbol} {formatCurrency(taxAmount)}
                  </span>
                </div>
              )}

              <div className="mt-5 flex justify-between overflow-hidden rounded-md bg-gradient-to-r from-[#1C3C75] from-[5%] to-[#1E90FF] to-[100%] text-white">
                <div className="flex-1 py-2 pl-4 text-lg font-bold">
                  Total Cost:
                </div>

                <div className="flex items-center justify-center whitespace-nowrap px-4 font-bold">
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

      <p className="text-xs text-slate-500 text-right pr-50">
        {invoice.taxInclusive ? "(Tax Inclusive)" : "(Tax Exclusive)"}
      </p>
    </section>
  );
}