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
          <h3 className="mb-4 text-lg font-bold text-[#0A4A95]">Note:</h3>

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
              <span>Sub Total:</span>
              <span>
                <span className="ml-1 text-sm font-normal pr-2 text-gray-500 font-extrabold">
                  {invoice.currency.code}
                </span>
                {formatCurrency(subtotal)}
              </span>
            </div>

            <div className="flex justify-between text-base font-semibold">
              <span>Tax:</span>
              <span>
                <span className="ml-1 text-sm font-normal pr-2 text-gray-500 font-extrabold">
                  {invoice.currency.code}
                </span>
                {formatCurrency(taxAmount)}
              </span>
            </div>

            <div className="flex justify-between text-base font-semibold">
              <span>Discount:</span>
              <span>
                {formatCurrency(invoice.discount)}
                <span className="ml-1 text-sm font-normal">
                  {invoice.discountType === "percent"
                    ? "%"
                    : invoice.currency.code}
                </span>
              </span>
            </div>

            <div className="mt-5 flex overflow-hidden rounded-md">
              <div className="flex-1 bg-[#173C8C] px-5 py-2 text-white font-bold text-lg text-right">
                Total Cost:
              </div>

              <div className="flex items-center justify-center bg-[#3DA9F5] px-6 text-xl font-bold text-white">
                <span className="ml-1 text-sm font-normal pr-2 text-gray-500 font-extrabold">
                  {invoice.currency.code}
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
