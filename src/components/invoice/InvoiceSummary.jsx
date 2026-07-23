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
import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { validateInvoice } from "@/vaidations/invoiceValidation";
import { loadNextDocumentNumber } from "../../utils/InvoiceCounter";

export default function InvoiceSummary({ onPrint }) {
  const invoice = useInvoiceStore((state) => state.invoice);

  const items = useInvoiceStore((state) => state.items);
  const updateInvoice = useInvoiceStore((state) => state.updateInvoice);
  const resetInvoice = useInvoiceStore((state) => state.resetInvoice);
  // const incrementInvoiceNumber = useInvoiceStore(
  //   (state) => state.incrementInvoiceNumber,
  // );
  const setErrors = useInvoiceStore((state) => state.setErrors);

  const [loading, setLoading] = useState(false);
  // const [showDepositInput, setShowDepositInput] = useState(false);

  const { subtotal, discountAmount, taxAmount, total, balanceDue } =
    useInvoiceTotals();

  const { totalContractValue, completedMilestoneValue } = useMemo(() => {
    const total = items.reduce(
      (sum, item) => sum + calculateItemRow(item).netTotal,
      0,
    );
    const completed = items
      .filter((item) => item.status === "Completed")
      .reduce((sum, item) => sum + calculateItemRow(item).netTotal, 0);
    return { totalContractValue: total, completedMilestoneValue: completed };
  }, [items]);

  const completionRatio =
    totalContractValue > 0 ? completedMilestoneValue / totalContractValue : 0;

  const contractAfterDiscount = totalContractValue - discountAmount;
  const netContractTotal = contractAfterDiscount + taxAmount;

  const invoiceDiscount = discountAmount * completionRatio;
  const invoiceAfterDiscount = completedMilestoneValue - invoiceDiscount;
  const invoiceTax = taxAmount * completionRatio;
  const dueThisInvoice = invoiceAfterDiscount + invoiceTax;
  const remaining = netContractTotal - dueThisInvoice;

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
      setLoading(true);

      const invoiceToSave = {
        ...invoice,
        subtotal,
        total,
        balanceDue,
      };

      const { isValid, errors } = validateInvoice(invoice, items, subtotal);

      if (!isValid) {
        setErrors(errors);
        toast.error("Please fix the errors in the invoice.");
        return;
      }

      const result = await saveDocument(invoiceToSave, items);
      console.log("Save result:", result);
      if (!result.success) {
        toast.error("Failed to save.");
        return;
      }

      toast.success("Saved successfully!");

      await onPrint();

      resetInvoice();
      setErrors({});

      // Load next document number after reset
      const nextDoc = await loadNextDocumentNumber(invoice.documentType);

      updateInvoice("documentCounter", nextDoc.documentCounter);
      updateInvoice("documentNumber", nextDoc.documentNumber);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving the invoice.");
    } finally {
      setLoading(false);
    }
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
                <span className="text-xs text-slate-400 mr-0.5">{invoice.currency.symbol}</span>
                {formatCurrency(totalContractValue)}
              </span>
            </div>

            {Number(invoice.discount) > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount ({discountLabel})</span>
                <span className="tabular-nums">
                  −<span className="text-xs mr-0.5">{invoice.currency.symbol}</span>
                  {formatCurrency(discountAmount)}
                </span>
              </div>
            )}

            {Number(invoice.tax) > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Tax ({taxLabel})</span>
                <span className="tabular-nums">
                  +<span className="text-xs mr-0.5">{invoice.currency.symbol}</span>
                  {formatCurrency(taxAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between font-bold text-gray-900 pt-1.5 border-t border-dashed border-slate-300">
              <span>Net Contract Total</span>
              <span className="tabular-nums">
                <span className="text-xs text-slate-400 mr-0.5">{invoice.currency.symbol}</span>
                {formatCurrency(netContractTotal)}
              </span>
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-slate-50 px-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Current Invoice
                </span>
              </div>
            </div>

            <div className="flex justify-between">
              <span>Completed Milestones Value</span>
              <span className="font-medium tabular-nums">
                <span className="text-xs text-slate-400 mr-0.5">{invoice.currency.symbol}</span>
                {formatCurrency(completedMilestoneValue)}
              </span>
            </div>

            {Number(invoice.discount) > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount ({discountLabel})</span>
                <span className="tabular-nums">
                  −<span className="text-xs mr-0.5">{invoice.currency.symbol}</span>
                  {formatCurrency(invoiceDiscount)}
                </span>
              </div>
            )}

            {Number(invoice.tax) > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Tax ({taxLabel})</span>
                <span className="tabular-nums">
                  +<span className="text-xs mr-0.5">{invoice.currency.symbol}</span>
                  {formatCurrency(invoiceTax)}
                </span>
              </div>
            )}

            <div className="flex justify-between font-bold text-gray-900 pt-1.5 border-t border-dashed border-slate-300">
              <span>Due This Invoice</span>
              <span className="tabular-nums">
                <span className="text-xs text-slate-400 mr-0.5">{invoice.currency.symbol}</span>
                {formatCurrency(dueThisInvoice)}
              </span>
            </div>

            <div className="flex justify-between text-xs text-slate-500">
              <span>Remaining (To Be Paid)</span>
              <span className="tabular-nums">
                <span className="text-xs mr-0.5">{invoice.currency.symbol}</span>
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

            {(Number(invoice.discount) > 0 || Number(invoice.tax) > 0) && (
              <div className="space-y-3 rounded-lg border bg-slate-50 p-4">
                {Number(invoice.discount) > 0 && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-700">Discount</span>
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                          {discountLabel}
                        </span>
                      </div>
                      <span className="font-semibold text-red-600">
                        − {invoice.currency.symbol} {formatCurrency(discountAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-3 text-sm text-slate-600">
                      <span>After Discount</span>
                      <span className="font-semibold text-slate-900">
                        {invoice.currency.symbol} {formatCurrency(subtotal - discountAmount)}
                      </span>
                    </div>
                  </>
                )}
                {Number(invoice.tax) > 0 && (
                  <>
                    <div className="flex items-center justify-between pt-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-700">Tax</span>
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                          {taxLabel}
                        </span>
                      </div>
                      <span className="font-semibold text-green-700">
                        + {invoice.currency.symbol} {formatCurrency(taxAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>After Tax</span>
                      <span className="font-semibold text-slate-900">
                        {invoice.currency.symbol} {formatCurrency(subtotal - discountAmount + taxAmount)}
                      </span>
                    </div>
                  </>
                )}
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

        {/* Discount Input */}
        <div className="space-y-2">
          <Label>Discount</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0"
              min={0}
              max={subtotal === 0 ? 0 : invoice.discountType === "percent" ? 100 : subtotal}
              value={invoice.discount === 0 ? "" : invoice.discount}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  updateInvoice("discount", 0);
                  return;
                }
                let num = Number(value);
                if (num < 0) num = 0;
                if (subtotal === 0) {
                  num = 0;
                } else if (invoice.discountType === "percent") {
                  num = Math.min(num, 100);
                } else {
                  num = Math.min(num, subtotal);
                }
                updateInvoice("discount", num);
              }}
            />
            <Select
              value={invoice.discountType}
              onValueChange={(value) => {
                updateInvoice("discountType", value);
                updateInvoice("discount", 0);
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

        {/* Tax Input */}
        <div className="space-y-2">
          <Label>Tax</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0"
              min={0}
              max={subtotal === 0 ? 0 : invoice.taxType === "percent" ? 100 : subtotal}
              value={invoice.tax === 0 ? "" : invoice.tax}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  updateInvoice("tax", 0);
                  return;
                }
                let num = Number(value);
                if (num < 0) num = 0;
                if (subtotal === 0) {
                  num = 0;
                } else if (invoice.taxType === "percent") {
                  num = Math.min(num, 100);
                } else {
                  num = Math.min(num, subtotal);
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
        <Button className="w-full" size="lg" onClick={handlePrintInvoice}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Printer className="mr-2 h-4 w-4" />
              Print {invoice.documentType}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
