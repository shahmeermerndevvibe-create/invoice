import { useState, useEffect } from "react";
import { RefreshCcw, Settings, CircleHelp, X, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaClockRotateLeft } from "react-icons/fa6";
import { useInvoiceStore } from "@/store/invoiceStore";
import { getLatestInvoiceCounter } from "@/actions/invoiceActions";
import { checkInvoiceNumberExists } from "@/actions/invoiceActions";
import { loadNextInvoiceNumber } from "../../utils/InvoiceCounter"
import toast from "react-hot-toast";

export default function InvoiceHeader() {
  const invoiceNo = useInvoiceStore((state) => state.invoice.invoiceNumber);
  const openInvoiceHistory = useInvoiceStore((state) => state.openInvoiceHistory);

  const updateInvoice = useInvoiceStore((state) => state.updateInvoice);

  const [editing, setEditing] = useState(false);
  const [tempInvoiceNo, setTempInvoiceNo] = useState(invoiceNo);
  const [loading, setLoading] = useState(false);

useEffect(() => {
  const load = async () => {
    try {
      setLoading(true);

      const nextInvoice = await loadNextInvoiceNumber();

      updateInvoice("invoiceCounter", nextInvoice.invoiceCounter);
      updateInvoice("invoiceNumber", nextInvoice.invoiceNumber);
      setTempInvoiceNo(nextInvoice.invoiceNumber);
    } finally {
      setLoading(false);
    }
  };

  load();
}, []);

  const handleSave = async () => {
    const newInvoiceNo = tempInvoiceNo.trim();
    if (!newInvoiceNo) {
      setEditing(false);
      return;
    }
    const exists = await checkInvoiceNumberExists(newInvoiceNo);
    if (exists) {
      toast.error("Invoice number already exists.");
      return;
    }
    updateInvoice("invoiceNumber", newInvoiceNo);
    setEditing(false);
  };

  return (
    <div className="flex items-center justify-between border-b bg-white px-6 py-4">
      <h1 className="flex items-center text-2xl font-bold text-gray-800">
        <FaClockRotateLeft className="mr-2 size-6 text-gray-600" />

        <span>Invoice</span>

        <span className="ml-2 font-normal text-gray-600">no.</span>

        {editing ? (
          <input
            autoFocus
            value={tempInvoiceNo}
            onChange={(e) => setTempInvoiceNo(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();

              if (e.key === "Escape") {
                setTempInvoiceNo(invoiceNo);
                setEditing(false);
              }
            }}
            className="ml-1 w-25 rounded border border-blue-500 px-1 py-0 text-2xl font-normal outline-none"
          />
        ) : (
          <span
            onClick={() => {
              setTempInvoiceNo(invoiceNo);
              setEditing(true);
            }}
            className="ml-1 cursor-pointer rounded px-1 font-normal transition hover:bg-gray-100 hover:ring-1 hover:ring-gray-300"
          >
            {loading ? (
              <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>{invoiceNo}</>
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
          title="Invoice History"
        >
          <Clock className="size-8 text-gray-600" />
        </Button>
        {/* <Button variant="ghost" size="icon" className="h-14 w-14 p-0">
          <User className="size-8 text-gray-600" />
        </Button> */}
        <Button variant="ghost" size="icon" className="h-14 w-14 p-0">
          <Settings className="size-8 text-gray-600" />
        </Button>
      </div>
    </div>
  );
}
