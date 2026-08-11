import { Globe, MapPin, Phone } from "lucide-react";

export default function BillingFooter({ isLastPage = true, invoice = {} }) {
  const phoneNo = invoice.companyPhone || "";
  const website = invoice.companyWebsite || "";
  const location = invoice.companyLocation || "";
  const signatureName = invoice.signatureName || "";
  const signatureTitle = invoice.signatureTitle || "";
  const thankYouText = invoice.thankYouText || "";
  const signatureUrl = invoice.signatureUrl || "";

  console.log("ıilling Footer", signatureUrl);

  return (
    <footer className="print-footer relative">
      <div
        className="px-8 pb-16 pt-4 md:px-14 relative z-10"
        style={{ bottom: "60px" }}
      >
        {/* Contact Items — every page */}
        <div
          className={`flex items-center text-xs mb-8 ${isLastPage ? "justify-between" : "justify-center"}`}
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-[#173C8C] p-1 text-white">
                <Phone size={12} />
              </div>
              <span className="font-semibold text-[11px]">{phoneNo}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-full bg-[#3DA9F5] p-1 text-white">
                <Globe size={12} />
              </div>
              <span className="font-semibold text-[11px]">{website}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-full bg-[#173C8C] p-1 text-white">
                <MapPin size={12} />
              </div>
              <span className="font-semibold text-[11px]">{location}</span>
            </div>
          </div>

           {/* Signature */}
          {isLastPage && (
            <div className="w-48 text-center">
              {/* Signature Image */}
              <div className="flex h-20 items-end justify-center">
                {signatureUrl ? (
                  <img
                    src={signatureUrl}
                    alt="Signature"
                    className="h-16 w-44 object-contain"
                  />
                ) : (
                  <div className="h-16" />
                )}
              </div>

              {/* Divider */}
              <div className="border-t-[1.5px] border-slate-300 pt-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {signatureName}
                </h3>

                <p className="text-[10px] font-semibold text-slate-600">
                  {signatureTitle}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Thank You Text — last page only */}
        {isLastPage && (
          <div className="absolute bottom-0 left-50 -translate-x-1/2 z-20">
            <h2 className="text-xl font-black uppercase whitespace-nowrap">
              <span className="text-slate-900 pr-2">{thankYouText}</span>
            </h2>
          </div>
        )}
      </div>

      <img
        src="/InvoiceFooter.svg"
        alt=""
        className="absolute bottom-0 left-1 w-full h-auto max-h-[120px] object-contain"
      />
    </footer>
  );
}
