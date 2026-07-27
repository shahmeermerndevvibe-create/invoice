import { Globe, MapPin, Phone } from "lucide-react";
import BottomBanner from "./BottomBanner";
import { useSettingsStore } from "@/store/settingsStore";

export default function BillingFooter({ hideContact }) {
  const phoneNo = useSettingsStore((s) => s.phoneNo);
  const website = useSettingsStore((s) => s.website);
  const location = useSettingsStore((s) => s.location);
  const signatureName = useSettingsStore((s) => s.signatureName);
  const signatureTitle = useSettingsStore((s) => s.signatureTitle);
  const thankYouText = useSettingsStore((s) => s.thankYouText);

  return (
    <footer className="print-footer relative">
      <div className="px-8 pb-16 pt-4 md:px-14 relative bottom-15 z-10">
        {!hideContact && (
        <div className="flex items-center justify-between text-xs mb-8">
          {/* Contact Items */}
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
          <div className="w-48 text-center">
            <div className="border-t-[1.5px] border-slate-300 pt-2">
              <h3 className="font-bold text-slate-900 text-sm">
                {signatureName}
              </h3>
              <p className="text-[10px] font-semibold text-slate-600">
                {signatureTitle}
              </p>
            </div>
          </div>
        </div>
        )}

        {/* Thank You Text */}
        <div className="absolute bottom-0 left-50 -translate-x-1/2 z-20">
          <h2 className="text-xl font-black uppercase whitespace-nowrap">
            <span className="text-slate-900 pr-2">{thankYouText}</span>
          </h2>
        </div>
      </div>

      <BottomBanner />
    </footer>
  );
}
