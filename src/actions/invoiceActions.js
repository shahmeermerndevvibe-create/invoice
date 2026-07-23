import { invoiceService, documentItemService } from "@/services/InvoiceService";

import { calculateInvoiceTotals } from "@/utils/invoiceUtils";

export const saveDocument = async (document, items) => {
  const totals = calculateInvoiceTotals(items, document);

  const documentData = {
    ...document,
    ...totals,
  };

  const itemData = items.map((item) => ({
    ...item,
    amount: (Number(item.qty) || 0) * (Number(item.rate) || 0),
  }));

  const documentId = await invoiceService.createDocument(documentData);

  await documentItemService.createItems(documentId, itemData);

  return {
    success: true,
    documentId,
  };
};

export const getLatestDocumentCounter = async (type) => {
  const counter = await invoiceService.getLatestDocumentCounter(type);
  return counter;
};

export const checkDocumentNumberExists = async (documentNumber, type) => {
  return invoiceService.checkDocumentNumberExists(documentNumber, type);
};

export const fetchDocumentHistory = async ({
  pageSize = 10,
  startAfterDoc = null,
  dateFrom = null,
  dateTo = null,
  searchQuery = "",
  documentType = null,
}) => {
  try {
    const result = await invoiceService.getDocumentsPaginated({
      pageSize,
      startAfterDoc,
      dateFrom,
      dateTo,
      documentType,
    });

    let { invoices } = result;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      invoices = invoices.filter((inv) => {
        const docNumber = (inv.documentNumber || "").toLowerCase();
        const customer = (inv.customer || "").toLowerCase();
        const email = (inv.customerEmail || "").toLowerCase();
        return (
          docNumber.includes(q) ||
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
    console.error("Failed to fetch document history:", error);
    return {
      success: false,
      invoices: [],
      lastDoc: null,
      hasMore: false,
    };
  }
};

export const fetchDocumentForPrint = async (documentId) => {
  try {
    const data = await invoiceService.getDocumentWithItems(documentId);
    if (!data) return { success: false };

    const { invoice, items } = data;
    const totals = calculateInvoiceTotals(items, invoice);

    return { success: true, invoice, items, totals };
  } catch (error) {
    console.error("Failed to fetch document for print:", error);
    return { success: false };
  }
};
