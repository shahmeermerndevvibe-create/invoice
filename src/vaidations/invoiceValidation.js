// src/validations/invoiceValidation.js

export const validateInvoice = (invoice = {}, items = [], subtotal = 0) => {
  const errors = {};

  // =====================
  // Customer Information
  // =====================

  if (!invoice.customer?.trim()) {
    errors.customer = "Customer is required.";
  }

  if (invoice.customerEmail?.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  if (!invoice.phoneNo?.trim()) {
    // errors.phoneNo = "Phone number is required.";
  } else {
    // const phoneRegex = /^03\d{2}\d{7}$/;

    // if (!phoneRegex.test(invoice.phoneNo)) {
    //   errors.phoneNo = "Phone number must be in the format 0312-3456789.";
    // }
  }

  if (invoice.notes?.length > 700) {
    errors.notes = "Notes cannot exceed 500 characters.";
  }

  // =====================
  // Discount
  // =====================

  const discount = Number(invoice.discount) || 0;

  if (!Number.isFinite(discount)) {
    errors.discount = "Discount must be a valid number.";
  } else if (discount < 0) {
    errors.discount = "Discount cannot be negative.";
  } else if (invoice.discountType === "percent" && discount > 100) {
    errors.discount = "Discount percentage cannot exceed 100%.";
  } else if (invoice.discountType === "fixed" && discount > subtotal) {
    errors.discount = "Discount cannot exceed the subtotal.";
  }

  const tax = Number(invoice.tax) || 0;

  if (!Number.isFinite(tax)) {
    errors.tax = "Tax must be a valid number.";
  } else if (tax < 0) {
    errors.tax = "Tax cannot be negative.";
  } else if (invoice.taxType === "percent" && tax > 100) {
    errors.tax = "Tax percentage cannot exceed 100%.";
  }

  if (invoice.taxType === "fixed" && tax > subtotal) {
    errors.tax = "Tax cannot exceed the subtotal.";
  }

  let payment = Number(invoice.payment) || 0;

  if (!Number.isFinite(payment)) {
    errors.payment = "Payment must be a valid number.";
  }
  const plainText = String(invoice.payment || "")
  .replace(/<div><br><\/div>/g, "<br>")
  .replace(/<\/div>\s*<div>/g, "<br>")
  .replace(/<div>/g, "")
  .replace(/<\/div>/g, "");

if (plainText.length > 1000) {
  errors.payment = "Payment instructions cannot exceed 1000 characters.";
}

// if (payment.includes("<img")) {
//   errors.payment = "Images are not allowed in payment instructions.";
// }

// if (payment.includes("<iframe")) {
//   errors.payment = "Embedded content is not allowed.";
// }

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
    return item.product?.trim() || item.serviceDate || item.qty || item.rate;
  });

  if (!filledItems.length) {
    errors.items = "At least one invoice item is required.";
  } else {
    const itemErrors = [];

    items.forEach((item, index) => {
      const isEmpty =
        !item.product?.trim() && !item.serviceDate && !item.qty && !item.rate;

      // Skip validation for completely empty rows
      if (isEmpty) {
        itemErrors[index] = {};
        return;
      }

      const current = {};

      if (!item.product?.trim()) {
        current.product = "Product is required.";
      }

      if (item.description?.length > 200) {
        current.description = "Description cannot exceed 200 characters.";
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

      const lineTotal =
        (Number(item.qty) || 0) * (Number(item.rate) || 0);
      const itemDiscount = Number(item.discount) || 0;

      if (item.discount !== "" && item.discount !== 0) {
        if (!Number.isFinite(itemDiscount)) {
          current.discount = "Service discount must be a valid number.";
        } else if (itemDiscount < 0) {
          current.discount = "Service discount cannot be negative.";
        } else if (item.discountType === "percent" && itemDiscount > 100) {
          current.discount = "Service discount cannot exceed 100%.";
        } else if (item.discountType === "fixed" && itemDiscount > lineTotal) {
          current.discount = "Service discount cannot exceed the line total.";
        }
      }

      itemErrors[index] = current;
    });

    if (itemErrors.some((item) => Object.keys(item).length > 0)) {
      errors.itemErrors = itemErrors;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
