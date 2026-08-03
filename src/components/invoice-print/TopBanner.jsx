import { formatDocumentId } from "@/utils/invoiceUtils";

export default function TopBanner({invoice}) {
  const title = (invoice?.documentType || "Invoice").toUpperCase();

  return (
    <div
      className="absolute w-[48%]"
      style={{
        top: "39px",
        right: "-4px",
        height: "166px",
        backgroundImage: "url('/HeaderImage.svg')",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex h-full flex-col items-end justify-center pr-12 text-white">
        <h1 className="text-3xl font-bold tracking-wider">
          {title}
        </h1>
        <p className="mt-2 text-sm font-bold tracking-widest pr-20">
          # {formatDocumentId(invoice)}
        </p>
      </div>
    </div>
  );
}