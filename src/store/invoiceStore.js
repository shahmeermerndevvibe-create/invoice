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

      // Invoice actions
      updateInvoice(field, value) {
        set((state) => ({
          invoice: {
            ...state.invoice,
            [field]: value,
          },
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
        })
      },

      resetInvoice() {
        set((state) => ({
          invoice: {
            ...invoiceModel,
            invoiceNumber: state.invoice.invoiceNumber, // Preserve the current invoice number
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

      incrementInvoiceNumber: () =>
        set((state) => ({
          invoice: {
            ...state.invoice,
            invoiceNumber: String(Number(state.invoice.invoiceNumber) + 1),
          },
        })),

      deleteItem(index) {
        set((state) => ({
          items: state.items.filter((_, i) => i !== index),
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
      name: "invoice-storage", // unique name
      partialize: (state) => ({
        invoice: state.invoice,
        items: state.items,
      }),
    },
  ),
);
