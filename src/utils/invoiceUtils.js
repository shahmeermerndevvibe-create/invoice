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
  const rows = items.map((item, index) => {
    const { lineTotal, discountAmount } = calculateItemRow(item);
    const price = lineTotal;
    const afterDiscount = price - discountAmount;
    const tax = calculateTax(afterDiscount, invoice);
    const total = afterDiscount + tax;

    return {
      index,
      label: `M${index + 1}`,
      status: item.status || "Pending",
      price,
      discountAmount,
      afterDiscount,
      tax,
      total,
    };
  });

  const dueThisInvoice = rows
    .filter((row) => row.status === "Current")
    .reduce((sum, row) => sum + row.total, 0);

  const remaining = rows
    .filter((row) => row.status === "Pending")
    .reduce((sum, row) => sum + row.total, 0);

  const totals = calculateInvoiceTotals(items, invoice);

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