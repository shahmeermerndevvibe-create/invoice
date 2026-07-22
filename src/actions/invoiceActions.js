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

export const fetchInvoiceHistory = async ({
  pageSize = 10,
  startAfterDoc = null,
  dateFrom = null,
  dateTo = null,
  searchQuery = "",
}) => {
  try {
    const result = await invoiceService.getInvoicesPaginated({
      pageSize,
      startAfterDoc,
      dateFrom,
      dateTo,
    });

    let { invoices } = result;

    // Firestore does not support native full-text search across multiple fields.
    // Client-side filtering is used for search on invoiceNumber, customer, and
    // customerEmail. For large datasets, consider Algolia, Typesense, or Meilisearch.
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      invoices = invoices.filter((inv) => {
        const invoiceNumber = (inv.invoiceNumber || "").toLowerCase();
        const customer = (inv.customer || "").toLowerCase();
        const email = (inv.customerEmail || "").toLowerCase();
        return (
          invoiceNumber.includes(q) ||
          customer.includes(q) ||
          email.includes(q)
        );
      });
    }

    return {
      success: true,
      invoices,
      lastDoc: result.lastDoc,
      hasMore: result.hasMore,
    };
  } catch (error) {
    console.error("Failed to fetch invoice history:", error);
    return {
      success: false,
      invoices: [],
      lastDoc: null,
      hasMore: false,
    };
  }
};

export const fetchInvoiceForPrint = async (invoiceId) => {
  try {
    const data = await invoiceService.getInvoiceWithItems(invoiceId);
    if (!data) return { success: false };

    const { invoice, items } = data;
    const totals = calculateInvoiceTotals(items, invoice);

    return { success: true, invoice, items, totals };
  } catch (error) {
    console.error("Failed to fetch invoice for print:", error);
    return { success: false };
  }
};

export const fetchInvoiceForReview = async (invoiceId) => {
  return await invoiceService.getInvoiceWithItems(invoiceId);
};