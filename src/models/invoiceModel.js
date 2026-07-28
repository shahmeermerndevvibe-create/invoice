export const invoiceModel = {
  documentNumber: "1001",
  documentCounter: 1001,
  documentType: "Invoice",
  documentYear: new Date().getFullYear().toString().slice(-2),
  documentSuffix: "",

  customer: "",
  customerEmail: "",
  billingAddress: "",

  invoiceDate: "",
  dueDate: "",

  currency: {
    code: "PKR",
    symbol: "Rs",
  },

  country: "Australia",
  businessNumber: "",

  subtotal: 0,
  discountType: "percent",
  discount: "",
  taxType: "percent",
  tax: "",
  total: 0,
  balanceDue: 0,
  notes: "",
  phoneNo: "",
  createdAt: new Date().toISOString(),
  payment: "",
  contractType: "Fixed",
  milestoneNumber: 1,
  isDraft: false,
};