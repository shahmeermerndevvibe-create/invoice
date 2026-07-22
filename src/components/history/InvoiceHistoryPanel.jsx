import { useState, useEffect, useRef, useCallback } from "react";
import { useReactToPrint } from "react-to-print";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useInvoiceStore } from "@/store/invoiceStore";
import { fetchInvoiceHistory, fetchInvoiceForPrint } from "@/actions/invoiceActions";
import { getDateRange } from "@/utils/historyUtils";
import InvoicePrint from "@/components/invoice-print/InvoicePrint";
import InvoiceHistoryFilters from "./InvoiceHistoryFilters";
import InvoiceHistoryList from "./InvoiceHistoryList";
import ReviewModal from "./ReviewModal";
import toast from "react-hot-toast";

export default function InvoiceHistoryPanel() {
  const isOpen = useInvoiceStore((s) => s.isInvoiceHistoryOpen);
  const close = useInvoiceStore((s) => s.closeInvoiceHistory);

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [canGoPrev, setCanGoPrev] = useState(false);
  const [search, setSearch] = useState("");
  const [preset, setPreset] = useState("");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [printData, setPrintData] = useState(null);
  const [reviewData, setReviewData] = useState(null);

  const cursors = useRef([null]);
  const page = useRef(0);
  const version = useRef(0);
  const printRef = useRef(null);

  const handlePrintAction = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Invoice",
  });

  const fetchData = useCallback(async () => {
    const id = ++version.current;
    setLoading(true);
    setError(null);

    try {
      const cursor = cursors.current[page.current] ?? null;
      const range = getDateRange(preset, customFrom, customTo);
      const result = await fetchInvoiceHistory({
        startAfterDoc: cursor, pageSize: 10,
        dateFrom: range.dateFrom, dateTo: range.dateTo,
        searchQuery: search,
      });

      if (id !== version.current) return;
      if (!result.success) throw new Error("Failed to fetch invoices");

      setInvoices(result.invoices);
      setHasMore(result.hasMore);
      setCanGoPrev(page.current > 0);
      cursors.current[page.current + 1] = result.lastDoc;
    } catch (err) {
      if (id !== version.current) return;
      console.error("Failed to load invoice history:", err);
      toast.error("Failed to load invoice history");
      setError("Failed to load invoices. Please try again.");
    } finally {
      if (id === version.current) setLoading(false);
    }
  }, [preset, customFrom, customTo, search]);

  const resetAndFetch = useCallback(() => {
    page.current = 0;
    cursors.current = [null];
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(resetAndFetch, 0);
    return () => clearTimeout(timer);
  }, [isOpen, resetAndFetch]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen) return;
    queueMicrotask(() => {
      setInvoices([]); setSearch(""); setPreset("");
      setCustomFrom(""); setCustomTo(""); setError(null);
      setHasMore(false); setCanGoPrev(false);
    });
    cursors.current = [null]; page.current = 0;
  }, [isOpen]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(resetAndFetch, 400);
    return () => clearTimeout(timer);
  }, [search, isOpen, resetAndFetch]);

  const handlePresetChange = (e) => {
    const val = e.target.value;
    setPreset(val);
    if (val !== "custom") { setCustomFrom(""); setCustomTo(""); }
    resetAndFetch();
  };

  const handleCustomDateChange = (type, value) => {
    setPreset("custom");
    if (type === "from") setCustomFrom(value);
    else setCustomTo(value);
    resetAndFetch();
  };

  const handlePrintClick = useCallback(async (invoiceId) => {
    try {
      const result = await fetchInvoiceForPrint(invoiceId);
      if (!result.success) throw new Error("Failed to fetch invoice data");
      setPrintData(result);
    } catch (err) {
      console.error("Print error:", err);
      toast.error("Failed to print invoice");
    }
  }, []);

  const handleReviewClick = useCallback(async (invoiceId) => {
    try {
      const result = await fetchInvoiceForPrint(invoiceId);
      if (!result.success) throw new Error("Failed to fetch invoice data");
      setReviewData(result);
    } catch (err) {
      console.error("Review error:", err);
      toast.error("Failed to load invoice details");
    }
  }, []);

  useEffect(() => {
    if (!printData) return;
    const timer = setTimeout(() => { handlePrintAction(); setPrintData(null); }, 50);
    return () => clearTimeout(timer);
  }, [printData, handlePrintAction]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-10 backdrop-blur-sm sm:pt-16"
        onClick={close}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="mx-2 flex h-[85vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-2xl sm:mx-4"
        >
          <div className="flex items-center justify-between border-b px-4 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-gray-900">Invoice History</h2>
            <button onClick={close} className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <InvoiceHistoryFilters
            search={search}
            preset={preset}
            customFrom={customFrom}
            customTo={customTo}
            onSearchChange={handleSearchChange}
            onPresetChange={handlePresetChange}
            onCustomDateChange={handleCustomDateChange}
          />

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            <InvoiceHistoryList
              invoices={invoices}
              loading={loading}
              error={error}
              onPrint={handlePrintClick}
              onReview={handleReviewClick}
            />
          </div>

          <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6">
            <span className="text-sm text-gray-500">
              {invoices.length > 0 && `${invoices.length} invoice${invoices.length > 1 ? "s" : ""}`}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { page.current--; fetchData(); }}
                disabled={!canGoPrev || loading}
                className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <button
                onClick={() => { page.current++; fetchData(); }}
                disabled={!hasMore || loading}
                className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {printData && (
        <div className="hidden">
          <div ref={printRef}>
            <InvoicePrint
              invoice={printData.invoice}
              items={printData.items}
              subtotal={printData.totals.subtotal}
              total={printData.totals.total}
              balanceDue={printData.totals.balanceDue}
              taxAmount={printData.totals.taxAmount}
            />
          </div>
        </div>
      )}

      {reviewData && (
        <ReviewModal data={reviewData} onClose={() => setReviewData(null)} />
      )}
    </>
  );
}
