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
import { ChevronDown } from "lucide-react";
import { ChevronUp } from "lucide-react";

import { useInvoiceStore } from "@/store/invoiceStore";
import { useInvoiceTotals } from "@/hooks/useInvoiceTotals";
import { formatCurrency } from "@/utils/invoiceUtils";
import { saveInvoice } from "@/actions/invoiceActions";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { validateInvoice } from "@/vaidations/invoiceValidation";
import { loadNextInvoiceNumber } from "../../utils/InvoiceCounter";

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

      const result = await saveInvoice(invoiceToSave, items);
      console.log("Invoice save result:", result);
      if (!result.success) {
        toast.error("Failed to save invoice.");
        return;
      }

      toast.success("Invoice saved successfully!");

      await onPrint();

      // Load next invoice number
      const nextInvoice = await loadNextInvoiceNumber();

      updateInvoice("invoiceCounter", nextInvoice.invoiceCounter);
      updateInvoice("invoiceNumber", nextInvoice.invoiceNumber);

      resetInvoice();
      setErrors({});
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

        {/* Subtotal */}

        <div className="flex items-center justify-between">
          <Label>Subtotal</Label>

          <span className="font-medium">
            {invoice.currency.symbol} {formatCurrency(subtotal)}
          </span>
        </div>

        {/* Calculation Breakdown */}
        {(Number(invoice.discount) > 0 || Number(invoice.tax) > 0) && (
          <div className="space-y-3 rounded-lg border bg-slate-50 p-4">
            {Number(invoice.discount) > 0 && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700">Discount</span>

                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                      {invoice.discountType === "percent"
                        ? `${invoice.discount}%`
                        : `${invoice.currency.symbol} ${formatCurrency(invoice.discount)}`}
                    </span>
                  </div>

                  <span className="font-semibold text-red-600">
                    − {invoice.currency.symbol} {formatCurrency(discountAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b pb-3 text-sm text-slate-600">
                  <span>After Discount</span>

                  <span className="font-semibold text-slate-900">
                    {invoice.currency.symbol}{" "}
                    {formatCurrency(subtotal - discountAmount)}
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
                      {invoice.taxType === "percent"
                        ? `${invoice.tax}%`
                        : `${invoice.currency.symbol} ${formatCurrency(invoice.tax)}`}
                    </span>
                  </div>

                  <span className="font-semibold text-green-700">
                    + {invoice.currency.symbol} {formatCurrency(taxAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>After Tax</span>

                  <span className="font-semibold text-slate-900">
                    {invoice.currency.symbol}{" "}
                    {formatCurrency(subtotal - discountAmount + taxAmount)}
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        <Separator />

        {/* Discount */}

        <div className="space-y-2">
          <Label>Discount</Label>

          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0"
              min={0}
              max={invoice.discountType === "percent" ? 100 : subtotal}
              value={invoice.discount === 0 ? "" : invoice.discount}
              onChange={(e) => {
                const value = e.target.value;

                if (value === "") {
                  updateInvoice("discount", 0);
                  return;
                }

                let num = Number(value);

                if (num < 0) num = 0;

                if (invoice.discountType === "percent") {
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

        <div className="space-y-2">
          <Label>Tax</Label>

          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0"
              min={0}
              max={invoice.taxType === "percent" ? 100 : subtotal}
              value={invoice.tax === 0 ? "" : invoice.tax}
              onChange={(e) => {
                const value = e.target.value;

                if (value === "") {
                  updateInvoice("tax", 0);
                  return;
                }

                let num = Number(value);

                if (num < 0) num = 0;

                if (invoice.taxType === "percent") {
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

        <Separator />

        {/* Total */}

        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>

          <span>
            {invoice.currency.symbol} {formatCurrency(total)}
          </span>
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
              Print Invoice
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
