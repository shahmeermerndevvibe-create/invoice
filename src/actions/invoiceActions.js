import { invoiceService, invoiceItemService } from "@/services/InvoiceService";

// import { validateInvoice } from "@/vaidations/invoiceValidation";
import { calculateInvoiceTotals } from "@/utils/invoiceUtils";
import toast from "react-hot-toast";

export const saveInvoice = async (invoice, items) => {
  // const { isValid, errors } = validateInvoice(invoice, items);

  // if (!isValid){
  //   toast.error("Please fix the errors in the invoice.");
  //   console.log("Validation errors:", errors);
  //   return {
  //     success: false,
  //     errors,
  //   };  
  // }

  const totals = calculateInvoiceTotals(items, invoice);

  const invoiceData = {
    ...invoice,
    ...totals,
  };

  const itemData = items.map((item) => ({
    ...item,
    amount: (Number(item.qty) || 0) * (Number(item.rate) || 0),
  }));

  const invoiceId = await invoiceService.createInvoice(invoiceData);

  await invoiceItemService.createItems(invoiceId, itemData);

  return {
    success: true,
    invoiceId,
  };
};

export const getLatestInvoiceCounter = async () => {
  const latestInvoiceCounter = await invoiceService.getLatestInvoiceCounter();
  console.log("Latest Invoice Number:", latestInvoiceCounter);
  return latestInvoiceCounter;
}

export const checkInvoiceNumberExists = async (invoiceNumber) => {
  const invoiceNumbers = await invoiceService.getAllInvoiceNumbers();

  return invoiceNumbers.includes(invoiceNumber);
};