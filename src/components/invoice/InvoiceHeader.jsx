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
import toast from "react-hot-toast";

const DOCUMENT_PREFIX = {
  Invoice: "INV-",
  Quotation: "QT-",
};

export default function InvoiceHeader() {
  const invoice = useInvoiceStore((state) => state.invoice);
  const openInvoiceHistory = useInvoiceStore((state) => state.openInvoiceHistory);
  const updateInvoice = useInvoiceStore((state) => state.updateInvoice);

  const [editing, setEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempDocumentNo, setTempDocumentNo] = useState(invoice.documentNumber);
  const [loading, setLoading] = useState(false);

  const loadCounter = useCallback(async () => {
    try {
      setLoading(true);
      const next = await loadNextDocumentNumber(invoice.documentType);
      updateInvoice("documentCounter", next.documentCounter);
      updateInvoice("documentNumber", next.documentNumber);
      setTempDocumentNo(next.documentNumber);
    } finally {
      setLoading(false);
    }
  }, [invoice.documentType, updateInvoice]);

  useEffect(() => {
    loadCounter();
  }, [loadCounter]);

  const handleSave = async () => {
    const newNo = tempDocumentNo.trim();
    if (!newNo) {
      setEditing(false);
      return;
    }
    const exists = await checkDocumentNumberExists(newNo, invoice.documentType);
    if (exists) {
      toast.error(`${invoice.documentType} number already exists.`);
      return;
    }
    updateInvoice("documentNumber", newNo);
    setEditing(false);
  };

  const prefix = DOCUMENT_PREFIX[invoice.documentType] || "";

  return (
    <div className="border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center text-2xl font-bold text-gray-800">
          <FaClockRotateLeft className="mr-2 size-6 text-gray-600" />
          <span>{invoice.documentType}</span>
          <span className="ml-2 font-normal text-gray-600">no.</span>
          {editing ? (
            <input
              autoFocus
              value={tempDocumentNo}
              onChange={(e) => setTempDocumentNo(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") {
                  setTempDocumentNo(invoice.documentNumber);
                  setEditing(false);
                }
              }}
              className="ml-1 w-25 rounded border border-blue-500 px-1 py-0 text-2xl font-normal outline-none"
            />
          ) : (
            <span
              onClick={() => {
                setTempDocumentNo(invoice.documentNumber);
                setEditing(true);
              }}
              className="ml-1 cursor-pointer rounded px-1 font-normal transition hover:bg-gray-100 hover:ring-1 hover:ring-gray-300"
            >
              {loading ? (
                <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>{prefix}{invoice.documentNumber}</>
              )}
            </span>
          )}
        </h1>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-14 w-14 p-0"
            onClick={openInvoiceHistory}
            title="Document History"
          >
            <Clock className="size-8 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-14 w-14 p-0"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="size-8 text-gray-600" />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        <div className="w-full md:w-44">
          <Label className="mb-2 block">Type</Label>
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

        <div className="w-full md:w-44">
          <Label className="mb-2 block">Contract</Label>
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

        <div className="w-full md:w-44">
          <Label className="mb-2 block">Country</Label>
          <Select
            value={invoice.country}
            onValueChange={(value) => updateInvoice("country", value)}
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

        <div className="w-full md:w-52">
          <Label className="mb-2 block">Business No</Label>
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
