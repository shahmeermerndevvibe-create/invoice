export const invoiceModel = {
  invoiceNumber: "1001",
  invoiceCounter: 1001,

  customer: "",
  customerEmail: "",
  billingAddress: "",

  // terms: "",
  invoiceDate: "",
  dueDate: "",

  currency: {
    code: "PKR",
    symbol: "Rs",
  },

  subtotal: 0,
  discountType: "percent",
  discount: "",
  taxType: "percent",
  tax: "",
  // deposit: "",
  total: 0,
  balanceDue: 0,
  notes: "",
  phoneNo: "",
  createdAt: new Date().toISOString(),
  payment: ""
};