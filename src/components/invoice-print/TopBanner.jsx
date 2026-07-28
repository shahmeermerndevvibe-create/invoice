import { formatDocumentId } from "@/utils/invoiceUtils";

export default function TopBanner({invoice}) {
  const title = (invoice?.documentType || "Invoice").toUpperCase();

  return (
    <div
      className="absolute w-[48%]"
      style={{
        top: "52px",
        right: "-4px",
        height: "156px",
        backgroundImage: "url('/HeaderImage.svg')",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex h-full flex-col items-end justify-center pr-8 text-white">
        <h1 className="text-3xl font-bold tracking-wider">
          {title}
        </h1>
        <p className="mt-2 text-sm tracking-widest pr-2.5">
          # {formatDocumentId(invoice)}
        </p>
      </div>
    </div>
  );
}