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
import { syncInvoiceDateNote } from "@/utils/invoiceDateNotes";

export default function CustomerSection() {
  const invoice = useInvoiceStore((state) => state.invoice);
  const items = useInvoiceStore((state) => state.items);
  const errors = useInvoiceStore((state) => state.errors);
  const clearInvoiceSectionError = useInvoiceStore(
    (state) => state.clearInvoiceSectionError,
  );
  // console.log("Errors in CustomerSection:", errors);

  const updateInvoice = useInvoiceStore((state) => state.updateInvoice);

  const { balanceDue, subtotal } = useInvoiceTotals();

  const hasItemDiscounts = items.some((item) => Number(item.discount) > 0);

  const formattedBalance = formatCurrency(balanceDue);

  const balanceClass =
    formattedBalance.length > 15
      ? "text-2xl lg:text-3xl"
      : formattedBalance.length > 10
        ? "text-3xl lg:text-4xl"
        : "text-4xl lg:text-5xl";

  const handleChange = (field, value) => {
    updateInvoice(field, value);
    clearInvoiceSectionError(field);
  };

  const handleInvoiceDateChange = (value) => {
    const current = useInvoiceStore.getState().invoice;
    updateInvoice("invoiceDate", value);
    updateInvoice("notes", syncInvoiceDateNote(current.notes, value));
    clearInvoiceSectionError("invoiceDate");
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
      AED: {
        code: "AED",
        symbol: "AED",
      },
    };

    updateInvoice("currency", currencies[code]);
  };

  return (
    <section className="py-5">
      <div className="flex flex-col gap-6 rounded-xl p-6 lg:flex-row lg:items-start">
        {/* Left */}
        <div className="flex flex-1 flex-col gap-5">
          {/* Customer & Business */}
          <div className="flex flex-wrap gap-4">
            {/* Business */}
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div>
                <Label className="mb-2 block">
                  Business Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Business Name"
                  required
                  value={invoice.businessName}
                  onChange={(e) => handleChange("businessName", e.target.value)}
                  className={`${errors.businessName ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20" : ""}`}
                />
                {errors.businessName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.businessName}
                  </p>
                )}
              </div>

              <div>
                <Label className="mb-2 block">
                  Business Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="business@example.com"
                  required
                  value={invoice.businessEmail}
                  onChange={(e) =>
                    handleChange("businessEmail", e.target.value)
                  }
                  className={`${errors.businessEmail ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20" : ""}`}
                />
                {errors.businessEmail && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.businessEmail}
                  </p>
                )}
              </div>

              <div>
                <Label className="mb-2 block">
                  Business Address <span className="text-red-500">*</span>
                </Label>

                <Textarea
                  placeholder="Street, City, State, ZIP Code, Country"
                  className={`min-h-24 resize-none ${errors.businessAddress ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20" : ""}`}
                  required
                  value={invoice.businessAddress}
                  onChange={(e) =>
                    handleChange("businessAddress", e.target.value)
                  }
                />
                {errors.businessAddress && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.businessAddress}
                  </p>
                )}
              </div>

               <div className="w-full md:w-52">
              <Label className="mb-2 block">
               Business Phone Number <span className="text-red-500"></span>
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

            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div>
                <Label className="mb-2 block">Contact Person Name</Label>
                <Input
                  placeholder="Business Person Name"
                  value={invoice.customer}
                  onChange={(e) => handleChange("customer", e.target.value)}
                />
              </div>

              <div>
                <Label className="mb-2 block">Contact Person Email</Label>

                <Input
                  placeholder="business@example.com"
                  value={invoice.customerEmail}
                  onChange={(e) =>
                    handleChange("customerEmail", e.target.value)
                  }
                />
              </div>

               <div>
                <Label className="mb-2 block">Contact Person Phone No</Label>

                <Input
                type="tel"
                placeholder="03123456789"
                value={invoice.contactPersonPhone}
                onChange={(e) => handleChange("contactPersonPhone", e.target.value)}
              />
              </div>
            </div>
          </div>

          {/* Terms & Dates */}

          <div className="flex flex-wrap gap-4">
            {/* <div className="w-full md:w-56">
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
            </div> */}

            <div className="w-full md:w-52">
              <Label className="mb-2 block">
                Invoice Date
                <span className="text-red-500 pl-1">*</span>
              </Label>

              <Input
                type="date"
                value={invoice.invoiceDate}
                required
                onChange={(e) => handleInvoiceDateChange(e.target.value)}
                className={`${errors.invoiceDate ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20" : ""}`}
              />
              {errors.invoiceDate && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.invoiceDate}
                </p>
              )}
            </div>

            <div className="w-full md:w-52">
              <Label className="mb-2 block">Due Date</Label>

              <Input
                type="date"
                value={invoice.dueDate}
                min={invoice.invoiceDate || undefined}
                disabled={!invoice.invoiceDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
              />
            </div>

            <div className="w-full md:w-52">
              <Label className="mb-2 block">Discount</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0"
                  min={0}
                  max={100}
                  disabled={hasItemDiscounts}
                  title={hasItemDiscounts ? "Clear item-level discounts first" : ""}
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
                  // disabled={hasItemDiscounts}
                  onValueChange={(value) => {
                    updateInvoice("discountType", value);
                    updateInvoice("discount", 0);
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* {hasItemDiscounts && (
                <p className="mt-1 text-xs text-amber-600">Item-level discounts are active. Clear them to use invoice-level discount.</p>
              )} */}
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

                <SelectItem value="AED">🇦🇪 AED</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-12 border-t pt-8 text-right">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Balance Due
            </p>

            <h2 className={`mt-3 font-bold tracking-tight ${balanceClass}`}>
              {invoice.currency.symbol} {formattedBalance}
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
