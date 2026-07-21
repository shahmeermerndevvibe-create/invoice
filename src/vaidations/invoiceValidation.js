// src/validations/invoiceValidation.js

export const validateInvoice = (invoice = {}, items = []) => {
  const errors = {};

  // =====================
  // Customer Information
  // =====================

  if (!invoice.customer?.trim()) {
    errors.customer = "Customer is required.";
  }

  if (invoice.customerEmail?.trim()) {
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(invoice.customerEmail)) {
      errors.customerEmail = "Invalid email address.";
    }
  }

  // =====================
  // Invoice Details
  // =====================

  if (!invoice.invoiceDate) {
    errors.invoiceDate = "Invoice date is required.";
  }

  // if (
  //   invoice.invoiceDate &&
  //   invoice.dueDate &&
  //   new Date(invoice.dueDate) <
  //     new Date(invoice.invoiceDate)
  // ) {
  //   errors.dueDate =
  //     "Due date cannot be before invoice date.";
  // }

  // if (!invoice.terms?.trim()) {
  //   errors.terms = "Payment terms are required.";
  // }

  if (!invoice.currency?.code) {
    errors.currency = "Currency is required.";
  }

  if(!invoice.phoneNo?.trim()) {
    // errors.phoneNo = "Phone number is required.";
  } else {
    const phoneRegex = /^03\d{2}\d{7}$/

    if (!phoneRegex.test(invoice.phoneNo)) {
      errors.phoneNo =
        "Phone number must be in the format 0312-3456789.";
    }
  }

  if (invoice.notes?.length > 500) {
    errors.notes = "Notes cannot exceed 500 characters.";
  }

  // =====================
  // Discount
  // =====================

  const discount = Number(invoice.discount) || 0;

  if (discount < 0) {
    errors.discount = "Discount cannot be negative.";
  }

  if (
    invoice.discountType === "percent" &&
    discount > 100
  ) {
    errors.discount =
      "Percentage discount cannot exceed 100%.";
  }

  const tax = Number(invoice.tax) || 0;

  if (tax < 0) {
    errors.tax = "Tax cannot be negative.";
  }

  if (
    invoice.taxType === "percent" &&
    tax > 100
  ) {
    errors.tax =
      "Percentage tax cannot exceed 100%.";
  }

  // =====================
  // Deposit
  // =====================

  // const deposit = Number(invoice.deposit) || 0;

  // if (deposit < 0) {
  //   errors.deposit =
  //     "Deposit cannot be negative.";
  // }


// =====================
// Invoice Items
// =====================

// Ignore completely empty rows
const filledItems = items.filter((item) => {
  return (
    item.product?.trim() ||
    item.serviceDate ||
    item.qty ||
    item.rate
  );
});

if (!filledItems.length) {
  errors.items =
    "At least one invoice item is required.";
} else {
  const itemErrors = [];

  items.forEach((item, index) => {
    const isEmpty =
      !item.product?.trim() &&
      !item.serviceDate &&
      !item.qty &&
      !item.rate;

    // Skip validation for completely empty rows
    if (isEmpty) {
      itemErrors[index] = {};
      return;
    }

    const current = {};

    if (!item.product?.trim()) {
  current.product = "Product is required.";
}

// if (!item.serviceDate) {
//   // current.serviceDate = "Service date is required.";
// }

if (item.qty === "") {
  current.qty = "Quantity is required.";
} else if (isNaN(Number(item.qty))) {
  current.qty = "Quantity must be a number.";
} else if (Number(item.qty) <= 0) {
  current.qty = "Quantity must be greater than 0.";
}

if (item.rate === "") {
  current.rate = "Rate is required.";
} else if (isNaN(Number(item.rate))) {
  current.rate = "Rate must be a number.";
} else if (Number(item.rate) <= 0) {
  current.rate = "Rate must be greater than 0.";
}

    itemErrors[index] = current;
  });

  if (
    itemErrors.some(
      (item) => Object.keys(item).length > 0
    )
  ) {
    errors.itemErrors = itemErrors;
  }
} 

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};