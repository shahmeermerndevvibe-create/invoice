import { getLatestInvoiceCounter } from "../actions/invoiceActions"

// invoiceActions.js
export const loadNextInvoiceNumber = async () => {
  const latestCounter = await getLatestInvoiceCounter();

  return {
    invoiceCounter: latestCounter + 1,
    invoiceNumber: String(latestCounter + 1),
  };
};