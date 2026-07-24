import { create } from "zustand";
import { persist } from "zustand/middleware";

import { invoiceModel } from "@/models/invoiceModel";
import { invoiceItemModel } from "@/models/invoiceItemModel";

export const useInvoiceStore = create(
  persist(
    (set) => ({
      invoice: {
        ...invoiceModel,
      },

      items: [
        {
          ...invoiceItemModel,
        },
      ],

      errors: {},

      payment: "",

      isInvoiceHistoryOpen: false,

      openInvoiceHistory: () => set({ isInvoiceHistoryOpen: true }),

      closeInvoiceHistory: () => set({ isInvoiceHistoryOpen: false }),

      toggleInvoiceHistory: () =>
        set((state) => ({ isInvoiceHistoryOpen: !state.isInvoiceHistoryOpen })),

      // Invoice actions
      updateInvoice(field, value) {
        set((state) => ({
          invoice: {
            ...state.invoice,
            [field]: value,
          },
          ...(field === "contractType"
            ? { items: state.items.map((item) => ({ ...item, status: "Pending" })) }
            : {}),
        }));
      },

      setErrors(errors) {
        set({
          errors,
        });
      },

      clearItemError(index, field) {
        set((state) => {
          const itemErrors = [...(state.errors.itemErrors || [])];

          if (itemErrors[index]) {
            delete itemErrors[index][field];

            if (Object.keys(itemErrors[index]).length === 0) {
              itemErrors[index] = {};
            }
          }

          return {
            errors: {
              ...state.errors,
              itemErrors,
            },
          };
        });
      },

      clearInvoiceSectionError(field) {
        set((state) => {
          const newErrors = { ...state.errors };
          delete newErrors[field];

          return {
            errors: newErrors,
          };
        });
      },

      resetInvoice() {
        set((state) => ({
          invoice: {
            ...invoiceModel,
            documentCounter: state.invoice.documentCounter,
            documentNumber: state.invoice.documentNumber,
            documentType: state.invoice.documentType,
          },
          items: [
            {
              ...invoiceItemModel,
            },
          ],
        }));
      },

      // Item actions
      addItem() {
        set((state) => ({
          items: [
            ...state.items,
            {
              ...invoiceItemModel,
            },
          ],
        }));
      },

      deleteItem(index) {
        set((state) => ({
          items: state.items.filter((_, i) => i !== index),
        }));
      },

      updateItem(index, field, value) {
        set((state) => ({
          items: state.items.map((item, i) =>
            i === index
              ? {
                  ...item,
                  [field]: value,
                }
              : item,
          ),
        }));
      },


      clearItems() {
        set({
          items: [
            {
              ...invoiceItemModel,
            },
          ],
        });
      },
    }),
    {
      name: "invoice-storage",
      partialize: (state) => ({
        invoice: state.invoice,
        items: state.items,
      }),
      merge: (persisted, current) => {
        const old = persisted.invoice || {};

        return {
          ...current,
          ...persisted,
          invoice: {
            ...current.invoice,
            ...old,
            documentCounter: old.documentCounter ?? old.invoiceCounter ?? current.invoice.documentCounter,
            documentNumber: old.documentNumber ?? (String(old.invoiceNumber ?? "") || current.invoice.documentNumber),
          },
          items: persisted.items || current.items,
        };
      },
    },
  ),
);
