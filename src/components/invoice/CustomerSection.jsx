import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { useInvoiceStore } from "@/store/invoiceStore";
import { useInvoiceTotals } from "@/hooks/useInvoiceTotals";
import { formatCurrency } from "@/utils/invoiceUtils";

export default function CustomerSection() {
  const invoice = useInvoiceStore((state) => state.invoice);
  const errors = useInvoiceStore((state) => state.errors);
  const clearInvoiceSectionError = useInvoiceStore((state) => state.clearInvoiceSectionError);
  console.log("Errors in CustomerSection:", errors);

  const updateInvoice = useInvoiceStore((state) => state.updateInvoice);

  const { balanceDue } = useInvoiceTotals();


  const handleChange = (field, value) => {
    updateInvoice(field, value);
    clearInvoiceSectionError(field);
  };

  const handleCurrencyChange = (code) => {
    const currencies = {
      PKR: {
        code: "PKR",
        symbol: "PKR",
      },
      USD: {
        code: "USD",
        symbol: "$",
      },
    };

    updateInvoice("currency", currencies[code]);
  };

  return (
    <section className="py-8">
      <div className="flex flex-col gap-6 rounded-xl p-6 lg:flex-row lg:items-start">
        {/* Left */}
        <div className="flex flex-1 flex-col gap-5">
          {/* Customer & Email */}
          <div className="flex flex-wrap gap-4">
            <div className="w-full md:w-72">
              <Label className="mb-2 block">
                Customer <span className="text-red-500">**</span>
              </Label>
              <Input
                placeholder="Customer Name"
                required
                value={invoice.customer}
                onChange={(e) => handleChange("customer", e.target.value)}
              />
              {errors.customer && (
                <p className="mt-1 text-sm text-red-500">{errors.customer}</p>
              )}
            </div>

            <div className="w-full md:flex-1">
              <Label className="mb-2 block">Customer Email</Label>

              <Input
                placeholder="customer@example.com"
                value={invoice.customerEmail}
                onChange={(e) => handleChange("customerEmail", e.target.value)}
              />
            </div>
          </div>

          {/* Customer Address */}

          <div>
            <Label className="mb-2 block">Customer Address</Label>

            <Textarea
              placeholder="Street, City, State, ZIP Code, Country"
              className="min-h-24 resize-none"
              value={invoice.billingAddress}
              onChange={(e) => handleChange("billingAddress", e.target.value)}
            />
          </div>

          {/* Terms & Dates */}

          <div className="flex flex-wrap gap-4">
            <div className="w-full md:w-56">
              <Label className="mb-2 block">Terms</Label>

              <Select
                value={invoice.terms}
                className="w-full"
                onValueChange={(value) => handleChange("terms", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select terms" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>

                  <SelectItem value="Net 7">Net 7</SelectItem>

                  <SelectItem value="Net 15">Net 15</SelectItem>

                  <SelectItem value="Net 30">Net 30</SelectItem>
                </SelectContent>
              </Select>
              {errors.terms && (
                <p className="mt-1 text-sm text-red-500">{errors.terms}</p>
              )}
            </div>

            <div className="w-full md:w-52">
              <Label className="mb-2 block">
                Invoice Date
                <span className="text-red-500 pl-1">**</span>
              </Label>

              <Input
                type="date"
                value={invoice.invoiceDate}
                required
                onChange={(e) => handleChange("invoiceDate", e.target.value)}
              />
              {errors.invoiceDate && (
                <p className="mt-1 text-sm text-red-500">{errors.invoiceDate}</p>
              )}
            </div>

            <div className="w-full md:w-52">
              <Label className="mb-2 block">Due Date</Label>

              <Input
                type="date"
                value={invoice.dueDate}
                min={invoice.invoiceDate || undefined}
                onChange={(e) => handleChange("dueDate", e.target.value)}
              />
            </div>

            <div className="w-full md:w-52">
              <Label className="mb-2 block">
                Phone Number <span className="text-red-500">**</span>
              </Label>

              <Input
                type="tel"
                placeholder="03123456789"
                value={invoice.phoneNo}
                onChange={(e) => handleChange("phoneNo", e.target.value)}
              />
              {errors.phoneNo && (
                <p className="mt-1 text-sm text-red-500">{errors.phoneNo}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right */}

        <div className="w-full rounded-xl border bg-slate-50 p-6 lg:w-96">
          <div>
            <Label className="mb-2 block">Currency</Label>

            <Select
              value={invoice.currency.code}
              onValueChange={handleCurrencyChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="PKR">🇵🇰 PKR</SelectItem>

                <SelectItem value="USD">🇺🇸 USD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-12 border-t pt-8 text-right">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Balance Due
            </p>

            <h2 className="mt-3 text-4xl font-bold tracking-tight lg:text-5xl">
              {invoice.currency.symbol} {formatCurrency(balanceDue)}
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
