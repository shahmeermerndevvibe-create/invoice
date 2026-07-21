export default function BillingInfo({
  invoice = {},
  payment = {
    title: "Payoneer Payment Link",
    description: "Payment via secure Payoneer transfer",
  },
}) {
  return (
    <section className="px-8 py-6 md:px-14">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="mb-2 text-sm font-bold uppercase tracking-[3px] text-slate-500">
            Invoice To
          </h4>

          <h2 className="mb-2 text-3xl font-bold text-slate-900">
            {invoice.customer}. 
          </h2>

          <p className="mb-2 text-slate-700">
            <span className="font-semibold">Phone:</span> {invoice.phoneNo}
          </p>

          <p className="text-slate-700">
            <span className="font-semibold">Address:</span>{" "}
            {invoice.billingAddress}
          </p>
        </div>

        {/* Right */}
        <div className="text-right">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800">
            Date:
            <span className="ml-2 font-medium normal-case">
              {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : null}
            </span>
          </h3>

          <div className="mt-12">
            <h4 className="mb-3 text-lg font-bold text-slate-900">
              {payment.title}
            </h4>

            <p className="text-sm text-slate-500">{payment.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}