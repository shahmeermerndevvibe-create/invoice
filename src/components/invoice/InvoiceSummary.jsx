import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
// import { ChevronDown } from "lucide-react";
// import { ChevronUp } from "lucide-react";

import { useInvoiceStore } from "@/store/invoiceStore";
import { useInvoiceTotals } from "@/hooks/useInvoiceTotals";
import { formatCurrency, calculateItemRow } from "@/utils/invoiceUtils";
import { saveDocument } from "@/actions/invoiceActions";
import { toast } from "react-hot-toast";
import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { validateInvoice } from "@/vaidations/invoiceValidation";

const validateAndNotify = (invoice, items, subtotal, setErrors) => {
  const { isValid, errors } = validateInvoice(invoice, items, subtotal);

  if (!isValid) {
    setErrors(errors);
    const messages = [];
    for (const [key, val] of Object.entries(errors)) {
      if (key === "itemErrors") {
        for (const item of val) messages.push(...Object.values(item));
      } else {
        messages.push(val);
      }
    }
    toast.error(
      <div className="text-left">
        {messages.map((msg, i) => (
          <p key={i} className={i > 0 ? "mt-1" : ""}>{msg}</p>
        ))}
      </div>
    );
  }

  return isValid;
};

export default function InvoiceSummary({ onPrint }) {
  const invoice = useInvoiceStore((state) => state.invoice);

  const items = useInvoiceStore((state) => state.items);
  const updateInvoice = useInvoiceStore((state) => state.updateInvoice);
  const resetInvoice = useInvoiceStore((state) => state.resetInvoice);
  const editingInvoiceId = useInvoiceStore((state) => state.editingInvoiceId);
  const setErrors = useInvoiceStore((state) => state.setErrors);
  const processing = useInvoiceStore((state) => state.processing);
  const setProcessing = useInvoiceStore((state) => state.setProcessing);
  const openInvoiceHistory = useInvoiceStore((state) => state.openInvoiceHistory);

  const { subtotal, itemDiscountsTotal, discountAmount, taxAmount, total, balanceDue } =
    useInvoiceTotals();

  const {
    totalContractValue,
    completedMilestoneValue,
    currentMilestoneValue,
    pendingMilestoneValue,
  } = useMemo(() => {
    const total = items.reduce(
      (sum, item) => sum + calculateItemRow(item).netTotal,
      0,
    );
    const completed = items
      .filter((item) => item.status === "Completed")
      .reduce((sum, item) => sum + calculateItemRow(item).netTotal, 0);
    const current = items
      .filter((item) => item.status === "Current")
      .reduce((sum, item) => sum + calculateItemRow(item).netTotal, 0);
    const pending = items
      .filter((item) => item.status === "Pending")
      .reduce((sum, item) => sum + calculateItemRow(item).netTotal, 0);
    return {
      totalContractValue: total,
      completedMilestoneValue: completed,
      currentMilestoneValue: current,
      pendingMilestoneValue: pending,
    };
  }, [items]);

  const netContractTotal = total;
  const adjustmentRatio =
    totalContractValue > 0 ? netContractTotal / totalContractValue : 1;
  const dueThisInvoice = currentMilestoneValue * adjustmentRatio;
  const remaining = pendingMilestoneValue * adjustmentRatio;

  const discountLabel =
    invoice.discountType === "percent"
      ? `${invoice.discount}%`
      : `${invoice.currency.symbol} ${formatCurrency(invoice.discount)}`;

  const taxLabel =
    invoice.taxType === "percent"
      ? `${invoice.tax}%`
      : `${invoice.currency.symbol} ${formatCurrency(invoice.tax)}`;

  const handlePrintInvoice = async () => {
    try {
      const currentInvoice = useInvoiceStore.getState().invoice;
      const invoiceToSave = {
        ...currentInvoice,
        subtotal,
        total,
        balanceDue,
      };

      if (!validateAndNotify(invoiceToSave, items, subtotal, setErrors)) {
        return;
      }

      setProcessing({ title: "Saving Invoice...", message: "Please wait while we save your invoice." });

      const result = await saveDocument(invoiceToSave, items);

      if (!result.success) {
        toast.error("Failed to save.");
        return;
      }

      toast.success("Saved successfully!");

      await onPrint();

      const nextCounter = invoiceToSave.documentCounter + 1;

      resetInvoice();
      setErrors({});

      updateInvoice("documentCounter", nextCounter);
      updateInvoice("documentNumber", String(nextCounter));
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving the invoice.");
    } finally {
      setProcessing(null);
    }
  };

  const handleDraftSaved = (draftInvoice) => {
    openInvoiceHistory();
    resetInvoice();
    setErrors({});
    const nextCounter = draftInvoice.documentCounter + 1;
    updateInvoice("documentCounter", nextCounter);
    updateInvoice("documentNumber", String(nextCounter));
  };

  const handleSaveDraft = async ({ newDraft = false } = {}) => {
    if (newDraft && editingInvoiceId) return;
    try {
      const current = useInvoiceStore.getState();
      const draftInvoice = {
        ...current.invoice,
        isDraft: true,
        ...(newDraft ? { draftType: "saved" } : {}),
      };

      if (!validateAndNotify(draftInvoice, current.items, subtotal, setErrors)) {
        return;
      }

      setProcessing({ title: "Saving Draft...", message: "Please wait while we save your draft." });

      const result = await saveDocument(draftInvoice, current.items);

      if (!result.success) {
        toast.error("Failed to save draft.");
        return;
      }

      toast.success("Draft saved!");

      if (newDraft || editingInvoiceId) {
        handleDraftSaved(draftInvoice);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving the draft.");
    } finally {
      setProcessing(null);
    }
  };

  const handleFinalizeDraft = async () => {
    updateInvoice("isDraft", false);
    updateInvoice("draftType", null);
    await handlePrintInvoice();
  };

  return (
    <Card className="sticky top-6 w-full max-w-md">
      <CardContent className="space-y-6 p-6">
        <h2 className="text-lg font-semibold">Summary</h2>

        {invoice.contractType === "Milestones" ? (
          <div className="rounded-lg border bg-slate-50 p-4 text-sm space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Contract Summary
            </p>

            <div className="flex justify-between">
              <span>Total Contract Value</span>
              <span className="font-medium tabular-nums">
                <span className="text-xs text-slate-400 mr-0.5">
                  {invoice.currency.symbol}
                </span>
                {formatCurrency(totalContractValue)}
              </span>
            </div>

            {Number(itemDiscountsTotal) > 0 && (
              <div className="flex justify-between">
                <span>Item Discounts</span>
                <span className="tabular-nums">
                  −
                  <span className="text-xs mr-0.5">
                    {invoice.currency.symbol}
                  </span>
                  {formatCurrency(itemDiscountsTotal)}
                </span>
              </div>
            )}

            {Number(discountAmount) > 0 && (
              <div className="flex justify-between">
                <span>Invoice Discount ({discountLabel})</span>
                <span className="tabular-nums">
                  −
                  <span className="text-xs mr-0.5">
                    {invoice.currency.symbol}
                  </span>
                  {formatCurrency(discountAmount)}
                </span>
              </div>
            )}

            {Number(taxAmount) > 0 && (
              <div className="flex justify-between">
                <span>Tax ({taxLabel})</span>
                <span className="tabular-nums">
                  +
                  <span className="text-xs mr-0.5">
                    {invoice.currency.symbol}
                  </span>
                  {formatCurrency(taxAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between font-bold text-gray-900 pt-1.5 border-t border-dashed border-slate-300">
              <span>Net Contract Value</span>
              <span className="tabular-nums">
                <span className="text-xs text-slate-400 mr-0.5">
                  {invoice.currency.symbol}
                </span>
                {formatCurrency(netContractTotal)}
              </span>
            </div>

            <div className="flex justify-between font-bold text-gray-900 pt-1.5 border-slate-300">
              <span>Due This Invoice</span>
              <span className="tabular-nums">
                <span className="text-xs text-slate-400 mr-0.5">
                  {invoice.currency.symbol}
                </span>
                {formatCurrency(dueThisInvoice)}
              </span>
            </div>

            <div className="flex justify-between text-xs text-slate-500">
              <span>Remaining to be paid</span>
              <span className="tabular-nums">
                <span className="text-xs mr-0.5">
                  {invoice.currency.symbol}
                </span>
                {formatCurrency(remaining)}
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <Label>Subtotal</Label>
              <span className="font-medium">
                {invoice.currency.symbol} {formatCurrency(subtotal)}
              </span>
            </div>

            {Number(itemDiscountsTotal) > 0 && (
              <>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Item Discounts</span>
                  <span className="font-medium">
                    − {invoice.currency.symbol} {formatCurrency(itemDiscountsTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Subtotal After Items</Label>
                  <span className="font-medium">
                    {invoice.currency.symbol} {formatCurrency(subtotal - itemDiscountsTotal)}
                  </span>
                </div>
              </>
            )}

            {Number(discountAmount) > 0 && (
              <div className="flex items-center justify-between">
                <Label>Invoice Discount ({discountLabel})</Label>
                <span className="font-medium">
                  − {invoice.currency.symbol} {formatCurrency(discountAmount)}
                </span>
              </div>
            )}

            {Number(taxAmount) > 0 && (
              <div className="flex items-center justify-between">
                <Label>Tax ({taxLabel})</Label>
                <span className="font-medium">
                  + {invoice.currency.symbol} {formatCurrency(taxAmount)}
                </span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>
                {invoice.currency.symbol} {formatCurrency(total)}
              </span>
            </div>
          </>
        )}

        {/* Tax Input */}
        <div className="space-y-2">
          <Label>Tax</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              disabled={!invoice.taxInclusive}
              placeholder="0"
              min={0}
              max={
                subtotal === 0
                  ? 0
                  : invoice.taxType === "percent"
                    ? 100
                    : subtotal - itemDiscountsTotal
              }
              value={invoice.tax === 0 ? "" : invoice.tax}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  updateInvoice("tax", 0);
                  return;
                }
                let num = Number(value);
                if (num < 0) num = 0;
                const afterItemDiscounts = subtotal - itemDiscountsTotal;
                if (subtotal === 0) {
                  num = 0;
                } else if (invoice.taxType === "percent") {
                  num = Math.min(num, 100);
                } else {
                  num = Math.min(num, afterItemDiscounts);
                }
                updateInvoice("tax", num);
              }}
            />
            <Select
              value={invoice.taxType}
              onValueChange={(value) => {
                updateInvoice("taxType", value);
                updateInvoice("tax", 0);
              }}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">%</SelectItem>
                <SelectItem value="fixed">{invoice.currency.code}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Deposit */}

        {/* <button
          className="text-sm cursor-pointer p-2 rounded bg-black/50
          text-white flex items-center gap-2
           hover:bg-black/70 transition-colors duration-200"
          onClick={() => setShowDepositInput(!showDepositInput)}
        >
          {showDepositInput ? "Hide Deposit" : "Add Deposit"}
          {showDepositInput ? <ChevronDown /> : <ChevronUp />}
        </button> */}

        {/* {showDepositInput && (
          <div className="space-y-2">
            <Label>Deposit</Label>

            <Input
              type="number"
              placeholder="0"
              value={invoice.deposit === 0 ? "" : invoice.deposit}
              onChange={(e) =>
                updateInvoice(
                  "deposit",
                  e.target.value === "" ? 0 : Number(e.target.value),
                )
              }
            />
          </div>
        )} */}

        {/* <Separator /> */}

        {/* Balance Due */}

        {/* {showDepositInput && (
          <div className="flex justify-between text-xl font-bold text-gray-600">
            <span>Balance Due</span>

            <span>
              {invoice.currency.symbol} {formatCurrency(balanceDue)}
            </span>
          </div>
        )} */}
        {invoice.isDraft ? (
          <div className="space-y-2">
            <Button className="w-full h-12" size="lg" onClick={handleSaveDraft} disabled={!!processing}>
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingInvoiceId ? (
                "Update Draft"
              ) : (
                "Save Draft"
              )}
            </Button>
            {editingInvoiceId && (
              <Button
                variant="outline"
                className="w-full h-12"
                size="lg"
                onClick={handleFinalizeDraft}
                disabled={!!processing}
              >
                Finalize
              </Button>
            )}
          </div>
        ) : (
          <>
            <Button className="w-full h-12" size="lg" onClick={handlePrintInvoice} disabled={!!processing}>
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingInvoiceId ? (
                <>
                  <Printer className="mr-2 h-4 w-4" />
                  Update Invoice
                </>
              ) : (
                <>
                  <Printer className="mr-2 h-4 w-4" />
                  Print {invoice.documentType}
                </>
              )}
            </Button>
            {!editingInvoiceId && (
              <Button
                variant="outline"
                className="w-full h-12"
                size="lg"
                onClick={() => handleSaveDraft({ newDraft: true })}
                disabled={!!processing}
              >
                Save Draft
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
