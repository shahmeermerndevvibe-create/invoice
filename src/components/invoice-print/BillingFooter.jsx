import { Globe, MapPin, Phone } from "lucide-react";
import BottomBanner from "./BottomBanner";

export default function BillingFooter() {
  return (
    <footer className="print-footer relative">
      <div className="px-8 pb-16 pt-4 md:px-14 relative bottom-15 z-10">
        {/* Contact & Signature Row */}
        <div className="flex items-center justify-between text-xs mb-8">
          {/* Contact Items */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-[#173C8C] p-1.5 text-white">
                <Phone size={12} />
              </div>
              <span className="font-semibold">+61 421 702 706</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-full bg-[#3DA9F5] p-1.5 text-white">
                <Globe size={12} />
              </div>
              <span className="font-semibold">www.devvibe.com</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-full bg-[#173C8C] p-1.5 text-white">
                <MapPin size={12} />
              </div>
              <span className="font-semibold">
                10 Leo Ave, Melbourne, Australia, 3029
              </span>
            </div>
          </div>

          {/* Signature */}
          <div className="w-48 text-center">
            <div className="border-t-[1.5px] border-slate-300 pt-2">
              <h3 className="font-bold text-slate-900 text-sm">
                Ajmal Jillani
              </h3>
              <p className="text-[10px] font-semibold text-slate-600">
                COO - DevVibe
              </p>
            </div>
          </div>
        </div>

        {/* Thank You Text */}
        <div className="absolute bottom-0 left-55 -translate-x-1/2 z-20">
          <h2 className="text-2xl font-black uppercase whitespace-nowrap">
            <span className="text-slate-900 pr-2">THANK YOU FOR</span>
            <span className="text-[#3DA9F5]">YOUR PAYMENT</span>
          </h2>
        </div>
      </div>

      <BottomBanner />
    </footer>
  );
}
