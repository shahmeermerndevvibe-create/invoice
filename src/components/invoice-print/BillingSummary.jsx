import { formatCurrency } from "@/utils/invoiceUtils";

export default function BillingSummary({
  invoice,
  subtotal,
  total,
  balanceDue,
  taxAmount,
}) {
  return (
    <section className="totals px-8 py-6 md:px-14">
      <div className="flex justify-between gap-10">
        {/* Notes */}
        <div className="md:col-span-7 pt-16">
          <h3 className="mb-4 text-2xl font-bold text-[#0A4A95]">Note:</h3>

          <div
            className="
             text-slate-700
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

        {/* Totals */}
        <div className="md:col-span-5">
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

              <div className="flex items-center justify-center px-6 text-xl font-bold text-white">
                <span className="ml-1 text-sm font-normal pr-2 font-extrabold">
                  {invoice.currency.symbol}
                </span>
                {formatCurrency(total) || 0.0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
