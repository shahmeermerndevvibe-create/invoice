const calculateDiscount = (subtotal, invoice) => {
  const discount = Number(invoice.discount) || 0;

  if (invoice.discountType === "percent") {
    return (subtotal * Math.min(discount, 100)) / 100;
  }

  return Math.min(discount, subtotal);
};

const calculateTax = (taxableAmount, invoice) => {
  const tax = Number(invoice.tax) || 0;

  if (invoice.taxType === "percent") {
    return (taxableAmount * tax) / 100;
  }

  return tax;
};

const calculateTotal = (
  afterItemDiscounts,
  discountAmount,
  taxAmount
) => {
  return (afterItemDiscounts - discountAmount) + taxAmount;
};

const calculateBalanceDue = (
  total,
  deposit = 0
) => {
  return total - (Number(deposit) || 0);
};

export const formatCurrency = (value = 0) => {
  return new Intl.NumberFormat("en-PK", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
};

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

// Distributes `total` across `weights` proportionally, rounding each share to
// 2 decimals via the largest-remainder method so the shares sum exactly to
// `round2(total)`.
export const distributeProportionally = (weights = [], total = 0) => {
  const count = weights.length;
  if (count === 0 || total <= 0) return weights.map(() => 0);

  const sum = weights.reduce((acc, w) => acc + w, 0);
  if (sum <= 0) return weights.map(() => 0);

  const raw = weights.map((w) => (w / sum) * total);
  const allocated = raw.map((v) => Math.floor(v * 100) / 100);

  let cents = Math.round(
    (round2(total) - allocated.reduce((acc, v) => acc + v, 0)) * 100,
  );

  const byFraction = raw
    .map((v, i) => ({ i, fraction: v - Math.floor(v * 100) / 100 }))
    .sort((a, b) => b.fraction - a.fraction);

  let idx = 0;
  while (cents > 0) {
    allocated[byFraction[idx % count].i] = round2(
      allocated[byFraction[idx % count].i] + 0.01,
    );
    cents--;
    idx++;
  }

  return allocated;
};

export const calculateItemRow = (item = {}) => {
  const qty = Number(item.qty) || 0;
  const rate = Number(item.rate) || 0;
  const lineTotal = qty * rate;

  const discount = Number(item.discount) || 0;
  const discountAmount = item.discountType === "percent"
    ? (lineTotal * Math.min(discount, 100)) / 100
    : Math.min(discount, lineTotal);

  return {
    lineTotal,
    discountAmount,
    netTotal: lineTotal - discountAmount,
  };
};

export function formatDocumentId(invoice) {
  if (!invoice) return "";
  const year = invoice.documentYear
    || (invoice.createdAt
      ? new Date(invoice.createdAt).getFullYear().toString().slice(-2)
      : new Date().getFullYear().toString().slice(-2));
  const number = invoice.documentNumber || "—";
  const base = `DV-${year}-${number}`;
  return invoice.documentSuffix ? `${base}-${invoice.documentSuffix}` : base;
}

export const calculateInvoiceTotals = (
  items = [],
  invoice = {}
) => {
  const itemRows = items.map(item => calculateItemRow(item));
  const subtotal = itemRows.reduce((sum, row) => sum + row.lineTotal, 0);
  const itemDiscountsTotal = itemRows.reduce((sum, row) => sum + row.discountAmount, 0);
  const afterItemDiscounts = subtotal - itemDiscountsTotal;

  const discountAmount = calculateDiscount(
    afterItemDiscounts,
    invoice
  );

  const taxableAmount = afterItemDiscounts - discountAmount;

  const taxAmount = calculateTax(
    taxableAmount,
    invoice
  );

  const total = calculateTotal(
    afterItemDiscounts,
    discountAmount,
    taxAmount
  );

  const balanceDue = calculateBalanceDue(
    total,
    invoice.deposit || 0
  );

  return {
    subtotal,
    itemDiscountsTotal,
    discountAmount,
    taxAmount,
    total,
    balanceDue,
  };
};

export const calculateMilestoneBreakdown = (items = [], invoice = {}) => {
  const itemRows = items.map((item) => {
    const { lineTotal, discountAmount } = calculateItemRow(item);
    return {
      lineTotal,
      itemDiscount: discountAmount,
      afterDiscount: lineTotal - discountAmount,
    };
  });

  const totals = calculateInvoiceTotals(items, invoice);

  const allocatedDiscounts = distributeProportionally(
    itemRows.map((row) => row.afterDiscount),
    round2(totals.discountAmount),
  );

  const taxableAmounts = itemRows.map(
    (row, index) => row.afterDiscount - (allocatedDiscounts[index] || 0),
  );

  const allocatedTaxes =
    invoice.taxType === "percent"
      ? taxableAmounts.map((amount) => calculateTax(amount, invoice))
      : distributeProportionally(taxableAmounts, round2(totals.taxAmount));

  const rows = items.map((item, index) => {
    const price = itemRows[index].lineTotal;
    const discountAmount = itemRows[index].itemDiscount;
    const invoiceDiscount = allocatedDiscounts[index] || 0;
    const taxableAmount = taxableAmounts[index];
    const tax = allocatedTaxes[index];
    const total = taxableAmount + tax;

    return {
      index,
      label: `M${index + 1}`,
      status: item.status || "Pending",
      price,
      discountAmount,
      invoiceDiscount,
      afterDiscount: itemRows[index].afterDiscount,
      taxableAmount,
      tax,
      total,
    };
  });

  // Reconcile the final row so the sum of milestone totals matches the
  // Billing Summary total after 2-decimal rounding. The residual is a pure
  // rounding artifact: the discount and fixed-tax shares are allocated above
  // so the per-row amounts already sum to the global totals, leaving only
  // each row's 2-decimal rounding to compensate for.
  const roundedTotals = rows.map((row) => round2(row.total));
  const residual = round2(
    round2(totals.total) -
      roundedTotals.reduce((sum, value) => sum + value, 0),
  );
  if (rows.length > 0) {
    roundedTotals[rows.length - 1] = round2(
      roundedTotals[rows.length - 1] + residual,
    );
    rows.forEach((row, index) => {
      row.total = roundedTotals[index];
    });
  }

  const dueThisInvoice = rows
    .filter((row) => row.status === "Current")
    .reduce((sum, row) => sum + row.total, 0);

  const remaining = rows
    .filter((row) => row.status === "Pending")
    .reduce((sum, row) => sum + row.total, 0);

  return {
    rows,
    subtotal: totals.subtotal,
    itemDiscountsTotal: totals.itemDiscountsTotal,
    discountAmount: totals.discountAmount,
    taxAmount: totals.taxAmount,
    netContractValue: totals.total,
    dueThisInvoice,
    remaining,
  };
};