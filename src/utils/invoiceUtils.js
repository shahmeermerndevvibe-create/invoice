const calculateSubtotal = (items = []) => {
  return items.reduce((sum, item) => {
    return sum + (Number(item.qty) || 0) * (Number(item.rate) || 0);
  }, 0);
};

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

export const calculateInvoiceTotals = (
  items = [],
  invoice = {}
) => {
  const subtotal = calculateSubtotal(items);

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