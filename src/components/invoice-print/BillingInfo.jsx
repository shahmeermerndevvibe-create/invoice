import { formatFirestoreDate } from "@/utils/dateUtils";

export default function BillingInfo({ invoice = {} }) {
  return (
    <section className="px-8 py-6 md:px-14">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="mb-2 text-sm font-bold uppercase tracking-[3px] text-black">
            Invoice To
          </h4>

          <h2 className="mb-2 text-4xl font-bold text-slate-900">
            {invoice.customer}. 
          </h2>

          <p className="mb-2 text-black font-bold">
            <span className="font-semibold">Phone:</span> {invoice.phoneNo}
          </p>

          <p className="text-black font-bold">
            <span className="font-semibold">Address:</span>{" "}
            {invoice.billingAddress}
          </p>
        </div>

        {/* Right */}
        <div className="text-right">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800">
            Date:
            <span className="ml-2 font-medium normal-case">
              {formatFirestoreDate(invoice.createdAt)}
            </span>
          </h3>

          {invoice.payment ? (
            <div className="mt-6">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-700">
                Payment Information
              </h4>
              {invoice.payment.startsWith("http://") ||
              invoice.payment.startsWith("https://") ? (
                <a
                  href={invoice.payment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 underline hover:text-blue-800"
                >
                  {invoice.payment}
                </a>
              ) : (
                <div
                  className="text-sm text-slate-500 [&_br]:block [&_br]:content-['']"
                  dangerouslySetInnerHTML={{ __html: invoice.payment }}
                />
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}