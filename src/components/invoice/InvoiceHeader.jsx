import { useState, useEffect, useCallback } from "react";
import { RefreshCcw, Settings, Clock } from "lucide-react";
import SettingsModal from "@/components/settings/SettingsModal";
import { Button } from "@/components/ui/button";
import { FaClockRotateLeft } from "react-icons/fa6";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useInvoiceStore } from "@/store/invoiceStore";
import { checkDocumentNumberExists } from "@/actions/invoiceActions";
import { loadNextDocumentNumber } from "../../utils/InvoiceCounter"
import { formatDocumentId } from "@/utils/invoiceUtils";
import toast from "react-hot-toast";


export default function InvoiceHeader() {
  const invoice = useInvoiceStore((state) => state.invoice);
  const openInvoiceHistory = useInvoiceStore((state) => state.openInvoiceHistory);
  const updateInvoice = useInvoiceStore((state) => state.updateInvoice);
  const applyCountrySettings = useInvoiceStore((state) => state.applyCountrySettings);

  const [editing, setEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempDocId, setTempDocId] = useState(formatDocumentId(invoice));
  const [loading, setLoading] = useState(false);

  const loadCounter = useCallback(async () => {
    try {
      setLoading(true);
      const next = await loadNextDocumentNumber(invoice.documentType);
      updateInvoice("documentCounter", next.documentCounter);
      updateInvoice("documentNumber", next.documentNumber);
      setTempDocId(formatDocumentId(useInvoiceStore.getState().invoice));
    } finally {
      setLoading(false);
    }
  }, [invoice.documentType, updateInvoice]);

  useEffect(() => {
    loadCounter();
  }, [loadCounter]);

  const parseDocId = (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const parts = trimmed.replace(/^DV-/i, "").split("-");
    if (parts.length < 2) return null;
    return {
      documentYear: parts[0],
      documentNumber: parts[1],
      documentSuffix: parts.slice(2).join("-"),
    };
  };

  const handleSave = async () => {
    const parsed = parseDocId(tempDocId);
    if (!parsed) {
      toast.error("Invalid document ID format. Use DV-YY-NNN[-SSS].");
      return;
    }
    const exists = await checkDocumentNumberExists(parsed.documentNumber, invoice.documentType);
    if (exists) {
      toast.error(`${invoice.documentType} number already exists.`);
      return;
    }
    updateInvoice("documentNumber", parsed.documentNumber);
    updateInvoice("documentYear", parsed.documentYear);
    updateInvoice("documentSuffix", parsed.documentSuffix);
    setEditing(false);
  };

  return (
    <div className="border-b bg-white px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex items-start justify-between gap-2 sm:items-center">
        <h1 className="flex flex-wrap items-center gap-x-2 text-lg font-bold text-gray-800 sm:text-2xl">
          <FaClockRotateLeft className="size-5 text-gray-600 sm:size-6" />
          <span>{invoice.documentType}</span>
          <span className="font-normal text-gray-600">no.</span>
          {editing ? (
            <input
              autoFocus
              value={tempDocId}
              onChange={(e) => setTempDocId(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") {
                  setTempDocId(formatDocumentId(invoice));
                  setEditing(false);
                }
              }}
              className="w-full min-w-[180px] rounded border border-blue-500 px-1 py-0 text-lg font-normal outline-none sm:w-60 sm:text-2xl"
            />
          ) : (
            <span
              onClick={() => {
                setTempDocId(formatDocumentId(invoice));
                setEditing(true);
              }}
              className="cursor-pointer rounded px-1 font-normal transition hover:bg-gray-100 hover:ring-1 hover:ring-gray-300 sm:text-2xl"
            >
              {loading ? (
                <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>{formatDocumentId(invoice)}</>
              )}
            </span>
          )}
        </h1>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 p-0 sm:h-14 sm:w-14"
            onClick={openInvoiceHistory}
            title="Document History"
          >
            <Clock className="size-6 text-gray-600 sm:size-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 p-0 sm:h-14 sm:w-14"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="size-6 text-gray-600 sm:size-8" />
          </Button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-4 sm:flex sm:flex-wrap sm:gap-4">
        <div className="col-span-2 sm:w-44">
          <Label className="mb-1 block text-xs sm:mb-2 sm:text-sm">Type</Label>
          <Select
            value={invoice.documentType}
            onValueChange={(value) => updateInvoice("documentType", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Invoice" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Invoice">Invoice</SelectItem>
              <SelectItem value="Quotation">Quotation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="sm:w-44">
          <Label className="mb-1 block text-xs sm:mb-2 sm:text-sm">Contract</Label>
          <Select
            value={invoice.contractType}
            onValueChange={(value) => updateInvoice("contractType", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Fixed" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fixed">Fixed</SelectItem>
              <SelectItem value="Milestones">Milestone</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="sm:w-44">
          <Label className="mb-1 block text-xs sm:mb-2 sm:text-sm">Country</Label>
          <Select
            value={invoice.country}
            onValueChange={applyCountrySettings}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Australia">Australia</SelectItem>
              <SelectItem value="Pakistan">Pakistan</SelectItem>
              <SelectItem value="USA">USA</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 sm:w-52">
          <Label className="mb-1 block text-xs sm:mb-2 sm:text-sm">Registeration No</Label>
          <Input
            placeholder="60733547866"
            value={invoice.businessNumber}
            onChange={(e) => updateInvoice("businessNumber", e.target.value)}
          />
        </div>

      </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
