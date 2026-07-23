import { useState, useEffect, useCallback } from "react";
import { RefreshCcw, Settings, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaClockRotateLeft } from "react-icons/fa6";
import { useInvoiceStore } from "@/store/invoiceStore";
import { checkDocumentNumberExists } from "@/actions/invoiceActions";
import { loadNextDocumentNumber } from "../../utils/InvoiceCounter"
import toast from "react-hot-toast";

const DOCUMENT_PREFIX = {
  Invoice: "INV-",
  Quotation: "QT-",
};

export default function InvoiceHeader() {
  const documentNumber = useInvoiceStore((state) => state.invoice.documentNumber);
  const documentType = useInvoiceStore((state) => state.invoice.documentType);
  const openInvoiceHistory = useInvoiceStore((state) => state.openInvoiceHistory);
  const updateInvoice = useInvoiceStore((state) => state.updateInvoice);

  const [editing, setEditing] = useState(false);
  const [tempDocumentNo, setTempDocumentNo] = useState(documentNumber);
  const [loading, setLoading] = useState(false);

  const loadCounter = useCallback(async () => {
    try {
      setLoading(true);

      const next = await loadNextDocumentNumber(documentType);

      updateInvoice("documentCounter", next.documentCounter);
      updateInvoice("documentNumber", next.documentNumber);
      setTempDocumentNo(next.documentNumber);
    } finally {
      setLoading(false);
    }
  }, [documentType, updateInvoice]);

  useEffect(() => {
    loadCounter();
  }, [loadCounter]);

  const handleSave = async () => {
    const newNo = tempDocumentNo.trim();
    if (!newNo) {
      setEditing(false);
      return;
    }
    const exists = await checkDocumentNumberExists(newNo, documentType);
    if (exists) {
      toast.error(`${documentType} number already exists.`);
      return;
    }
    updateInvoice("documentNumber", newNo);
    setEditing(false);
  };
 
  console.log("Rendering InvoiceHeader with documentNumber:", documentNumber, "and documentType:", documentType);
  const prefix = DOCUMENT_PREFIX[documentType] || "";

  return (
    <div className="flex items-center justify-between border-b bg-white px-6 py-4">
      <h1 className="flex items-center text-2xl font-bold text-gray-800">
        <FaClockRotateLeft className="mr-2 size-6 text-gray-600" />

        <span>{documentType}</span>

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
                setTempDocumentNo(documentNumber);
                setEditing(false);
              }
            }}
            className="ml-1 w-25 rounded border border-blue-500 px-1 py-0 text-2xl font-normal outline-none"
          />
        ) : (
          <span
            onClick={() => {
              setTempDocumentNo(documentNumber);
              setEditing(true);
            }}
            className="ml-1 cursor-pointer rounded px-1 font-normal transition hover:bg-gray-100 hover:ring-1 hover:ring-gray-300"
          >
            {loading ? (
              <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>{prefix}{documentNumber}</>
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
        <Button variant="ghost" size="icon" className="h-14 w-14 p-0">
          <Settings className="size-8 text-gray-600" />
        </Button>
      </div>
    </div>
  );
}
