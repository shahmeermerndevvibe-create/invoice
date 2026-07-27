import { invoiceService, documentItemService } from "@/services/InvoiceService";
import { useInvoiceStore } from "@/store/invoiceStore";
import { calculateInvoiceTotals } from "@/utils/invoiceUtils";

const stripItemMeta = ({ id, createdAt, updatedAt, documentId, ...rest }) => rest;

const itemSignature = (item) =>
  `${item.product}|${item.rate}|${item.qty}|${item.description}|${item.status}`;

const deduplicateItems = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const sig = itemSignature(item);
    if (seen.has(sig)) return false;
    seen.add(sig);
    return true;
  });
};

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

  const editingInvoiceId = useInvoiceStore.getState().editingInvoiceId;

  if (editingInvoiceId) {
    const { id, createdAt, updatedAt, ...cleanData } = documentData;
    await invoiceService.updateDocument(editingInvoiceId, cleanData);

    const existingItems = await documentItemService.getItems(editingInvoiceId);
    const completedItems = deduplicateItems(
      existingItems.filter((item) => item.status === "Completed"),
    );
    const completedItemIds = new Set(completedItems.map((item) => item.id));

    const itemsToDelete = existingItems.filter((item) => !completedItemIds.has(item.id));
    await Promise.all(itemsToDelete.map((item) => documentItemService.deleteItem(item.id)));

    const incomingEditableItems = itemData.filter(
      (item) => !item.id || !completedItemIds.has(item.id),
    );

    const preservedCompletedData = completedItems.map(stripItemMeta);

    await documentItemService.createItems(
      editingInvoiceId,
      [...preservedCompletedData, ...incomingEditableItems.map(stripItemMeta)],
    );

    return { success: true, documentId: editingInvoiceId };
  }

  const documentId = await invoiceService.createDocument(documentData);

  await documentItemService.createItems(documentId, itemData.map(stripItemMeta));

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
    const dedupedItems = deduplicateItems(items);
    const totals = calculateInvoiceTotals(dedupedItems, invoice);

    return { success: true, invoice, items: dedupedItems, totals };
  } catch (error) {
    console.error("Failed to fetch document for print:", error);
    return { success: false };
  }
};
