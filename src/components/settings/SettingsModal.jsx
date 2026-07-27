import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/settingsStore";
import toast from "react-hot-toast";

export default function SettingsModal({ onClose }) {
  const phoneNo = useSettingsStore((s) => s.phoneNo);
  const website = useSettingsStore((s) => s.website);
  const location = useSettingsStore((s) => s.location);
  const signatureName = useSettingsStore((s) => s.signatureName);
  const signatureTitle = useSettingsStore((s) => s.signatureTitle);
  const thankYouText = useSettingsStore((s) => s.thankYouText);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const saveSettings = useSettingsStore((s) => s.saveSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleDone = async () => {
    try {
      setSaving(true);
      await saveSettings();
      toast.success("Settings saved successfully!");
      onClose();
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-4 flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-4 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Contact Info
            </h3>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={phoneNo}
                onChange={(e) => updateSettings("phoneNo", e.target.value)}
                placeholder="+61 421 702 706"
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={website}
                onChange={(e) => updateSettings("website", e.target.value)}
                placeholder="www.devvibe.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={location}
                onChange={(e) => updateSettings("location", e.target.value)}
                placeholder="10 Leo Ave, Melbourne, Australia, 3029"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Signature
            </h3>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={signatureName}
                onChange={(e) => updateSettings("signatureName", e.target.value)}
                placeholder="Ajmal Jillani"
              />
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={signatureTitle}
                onChange={(e) => updateSettings("signatureTitle", e.target.value)}
                placeholder="COO - DevVibe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Thank You Text</Label>
            <Input
              value={thankYouText}
              onChange={(e) => updateSettings("thankYouText", e.target.value)}
              placeholder="THANK YOU FOR YOUR PAYMENT"
            />
          </div>
        </div>

        <div className="flex justify-end border-t px-6 py-4">
          <Button onClick={handleDone} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Done"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
