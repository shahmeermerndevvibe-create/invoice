const DOCUMENT_PREFIX = {
  Invoice: "INV-",
  Quotation: "QT-",
};

export default function TopBanner({invoice}) {
  const title = (invoice?.documentType || "Invoice").toUpperCase();
  const prefix = DOCUMENT_PREFIX[invoice?.documentType] || "INV-";

  return (
    <div className="absolute top-0 right-0 w-[48%] h-39">
      <svg
        viewBox="0 0 500 180"
        className="absolute top-3 inset-0 w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="invoiceGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#063B82" />
            <stop offset="100%" stopColor="#2AA8F4" />
          </linearGradient>
        </defs>

        <path
          d="
            M140 0
            C95 0 70 55 45 95
            C25 125 10 155 0 180
            L500 180
            L500 0
            Z
          "
          fill="url(#invoiceGradient)"
        />
      </svg>

      <div className="relative z-10 flex h-full flex-col items-end justify-center pr-12 text-white">
        <h1 className="text-3xl font-bold tracking-wider">
          {title}
        </h1>

        <p className="mt-2 text-sm tracking-widest">
          # {prefix}{invoice?.documentNumber}
        </p>

        <p>
          Contract Type: <span className="font-medium">{invoice?.contractType || "Fixed"}</span>
        </p>
      </div>
    </div>
  );
}