import { create } from "zustand";
import { persist } from "zustand/middleware";

import { invoiceModel } from "@/models/invoiceModel";
import { invoiceItemModel } from "@/models/invoiceItemModel";
import { useSettingsStore } from "@/store/settingsStore";

const settings = useSettingsStore.getState();
const defaultCountry = "Australia";
const defaultCountrySettings = settings.byCountry[defaultCountry] || {};

export const useInvoiceStore = create(
  persist(
    (set) => ({
      invoice: {
        ...invoiceModel,
        companyPhone: defaultCountrySettings.phoneNo || "",
        companyWebsite: defaultCountrySettings.website || "",
        companyLocation: defaultCountrySettings.location || "",
        signatureName: defaultCountrySettings.signatureName || "",
        signatureTitle: defaultCountrySettings.signatureTitle || "",
        thankYouText: defaultCountrySettings.thankYouText || "",
      },

      items: [
        {
          ...invoiceItemModel,
        },
      ],

      errors: {},

      payment: "",

      isInvoiceHistoryOpen: false,

      editingInvoiceId: null,

      processing: null,

      setInvoice: (invoice) => set({ invoice }),

      setItems: (items) => set({ items }),

      setEditingInvoiceId: (id) => set({ editingInvoiceId: id }),

      setProcessing: (processing) => set({ processing }),

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
        const current = useSettingsStore.getState();
        set((state) => {
          const country = state.invoice.country || "Australia";
          const cs = current.byCountry[country] || {};
          return {
            invoice: {
              ...invoiceModel,
              companyPhone: cs.phoneNo || "",
              companyWebsite: cs.website || "",
              companyLocation: cs.location || "",
              signatureName: cs.signatureName || "",
              signatureTitle: cs.signatureTitle || "",
              thankYouText: cs.thankYouText || "",
              documentCounter: state.invoice.documentCounter,
              documentNumber: state.invoice.documentNumber,
              documentType: state.invoice.documentType,
            },
            items: [
              {
                ...invoiceItemModel,
              },
            ],
            editingInvoiceId: null,
          };
        });
      },

      syncCompanyFieldsFromSettings() {
        const current = useSettingsStore.getState();
        const { editingInvoiceId, invoice } = useInvoiceStore.getState();
        if (editingInvoiceId) return;
        const country = invoice.country || "Australia";
        const cs = current.byCountry[country] || {};
        set({
          invoice: {
            ...invoice,
            companyPhone: cs.phoneNo || "",
            companyWebsite: cs.website || "",
            companyLocation: cs.location || "",
            signatureName: cs.signatureName || "",
            signatureTitle: cs.signatureTitle || "",
            thankYouText: cs.thankYouText || "",
          },
        });
      },

      applyLatestCompanyDetails() {
        const current = useSettingsStore.getState();
        const { invoice } = useInvoiceStore.getState();
        const country = invoice.country || "Australia";
        const cs = current.byCountry[country] || {};
        set({
          invoice: {
            ...invoice,
            companyPhone: cs.phoneNo || "",
            companyWebsite: cs.website || "",
            companyLocation: cs.location || "",
            signatureName: cs.signatureName || "",
            signatureTitle: cs.signatureTitle || "",
            thankYouText: cs.thankYouText || "",
          },
        });
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


      reorderItems(fromIndex, toIndex) {
        set((state) => {
          const items = [...state.items];
          const [moved] = items.splice(fromIndex, 1);
          items.splice(toIndex, 0, moved);
          return { items };
        });
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
            companyPhone: current.invoice.companyPhone,
            companyWebsite: current.invoice.companyWebsite,
            companyLocation: current.invoice.companyLocation,
            signatureName: current.invoice.signatureName,
            signatureTitle: current.invoice.signatureTitle,
            thankYouText: current.invoice.thankYouText,
            documentCounter: old.documentCounter ?? old.invoiceCounter ?? current.invoice.documentCounter,
            documentNumber: old.documentNumber ?? (String(old.invoiceNumber ?? "") || current.invoice.documentNumber),
          },
          items: persisted.items || current.items,
        };
      },
    },
  ),
);
