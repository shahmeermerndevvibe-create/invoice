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

export default function InvoiceSummary({ onPrint }) {
  const invoice = useInvoiceStore((state) => state.invoice);
  console.log("InvoiceSummary - invoice:", invoice);
  const items = useInvoiceStore((state) => state.items);
  const updateInvoice = useInvoiceStore((state) => state.updateInvoice);
  const resetInvoice = useInvoiceStore((state) => state.resetInvoice);
  const incrementInvoiceNumber = useInvoiceStore(
    (state) => state.incrementInvoiceNumber,
  );
  const setErrors = useInvoiceStore((state) => state.setErrors);

  const [loading, setLoading] = useState(false);
  const [showDepositInput, setShowDepositInput] = useState(false);

  const { subtotal, total, balanceDue } = useInvoiceTotals();

  const handlePrintInvoice = async () => {
    try {
      console.log("Starting invoice save process...");
      setLoading(true);
      const invoiceToSave = {
        ...invoice,
        subtotal,
        total,
        balanceDue,
      };
  
      const { isValid, errors } = validateInvoice(invoice, items);

      if (!isValid) {
        toast.error("Please fix the errors in the invoice.");
        console.log("Validation errors:", errors);
        setErrors(errors); // Set the errors in the store
        return {
          success: false,
          errors,
        };
      }

      const result = await saveInvoice(invoiceToSave, items);
      if (!result.success) {
        toast.error("Failed to save invoice. Please check the errors.");
        return;
      }
      toast.success("Invoice saved successfully!");

      await onPrint(); 

      incrementInvoiceNumber();
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

        <Separator />

        {/* Discount */}

        <div className="space-y-2">
          <Label>Discount</Label>

          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0"
              value={invoice.discount === 0 ? "" : invoice.discount}
              onChange={(e) =>
                updateInvoice(
                  "discount",
                  e.target.value === "" ? 0 : Number(e.target.value),
                )
              }
            />

            <Select
              value={invoice.discountType}
              onValueChange={(value) => updateInvoice("discountType", value)}
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
              value={invoice.tax === 0 ? "" : invoice.tax}
              onChange={(e) =>
                updateInvoice(
                  "tax",
                  e.target.value === "" ? 0 : Number(e.target.value),
                )
              }
            />

            <Select
              value={invoice.taxType}
              onValueChange={(value) => updateInvoice("taxType", value)}
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

        <button
          className="text-sm cursor-pointer p-2 rounded bg-black/50
          text-white flex items-center gap-2
           hover:bg-black/70 transition-colors duration-200"
          onClick={() => setShowDepositInput(!showDepositInput)}
        >
          {showDepositInput ? "Hide Deposit" : "Add Deposit"}
          {showDepositInput ? <ChevronDown /> : <ChevronUp />}
        </button>

        {showDepositInput && (
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
        )}

        <Separator />

        {/* Balance Due */}

        {showDepositInput && (
          <div className="flex justify-between text-xl font-bold text-gray-600">
            <span>Balance Due</span>

            <span>
              {invoice.currency.symbol} {formatCurrency(balanceDue)}
            </span>
          </div>
        )}
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
