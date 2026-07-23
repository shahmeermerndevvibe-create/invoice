const calculateDiscount = (subtotal, invoice) => {
  const discount = Number(invoice.discount) || 0;

  if (invoice.discountType === "percent") {
    return (subtotal * discount) / 100;
  }

  return discount;
};

const calculateTax = (taxableAmount, invoice) => {
  const tax = Number(invoice.tax) || 0;

  if (invoice.taxType === "percent") {
    return (taxableAmount * tax) / 100;
  }

  return tax;
};

const calculateTotal = (
  subtotal,
  discountAmount,
  taxAmount
) => {
  return (subtotal - discountAmount) + taxAmount;
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

export const calculateInvoiceTotals = (
  items = [],
  invoice = {}
) => {
  const itemRows = items.map(item => calculateItemRow(item));
  const subtotal = itemRows.reduce((sum, row) => sum + row.netTotal, 0);

  const discountAmount = calculateDiscount(
    subtotal,
    invoice
  );

  const taxableAmount = subtotal - discountAmount;  

  const taxAmount = calculateTax(
    taxableAmount,
    invoice
  );

  const total = calculateTotal(
    subtotal,
    discountAmount,
    taxAmount
  );

  const balanceDue = calculateBalanceDue(
    total,
    invoice.deposit || 0
  );

  return {
    subtotal,
    discountAmount,
    taxAmount,
    total,
    balanceDue,
  };
};