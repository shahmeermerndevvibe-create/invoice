import { create } from "zustand";
import { persist } from "zustand/middleware";

import { invoiceModel } from "@/models/invoiceModel";
import { invoiceItemModel } from "@/models/invoiceItemModel";
import { useSettingsStore } from "@/store/settingsStore";

const defaultCountry = "Australia";

const countryFieldsFromSettings = (country) => {
  const cs = useSettingsStore.getState().byCountry[country] || {};
  return {
    companyPhone: cs.phoneNo || "",
    companyWebsite: cs.website || "",
    companyLocation: cs.location || "",
    businessNumber: cs.businessNumber || "",
    signatureName: cs.signatureName || "",
    signatureTitle: cs.signatureTitle || "",
    thankYouText: cs.thankYouText || "",
  };
};

const companyFieldsFromSettings = (country) => {
  const settings = useSettingsStore.getState();
  return {
    ...countryFieldsFromSettings(country),
    signatureUrl: settings.signatureUrl || "",
    signaturePublicId: settings.signaturePublicId || "",
  };
};

export const useInvoiceStore = create(
  persist(
    (set) => ({
      invoice: {
        ...invoiceModel,
        ...companyFieldsFromSettings(defaultCountry),
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

      loadInvoiceForEdit: (invoice) => {
        set({ invoice });
        useInvoiceStore.getState().syncCompanyFieldsFromSettings();
      },

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
          ...(field === "discountType"
            ? { items: state.items.map((item) => ({ ...item, discountType: value })) }
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
        set((state) => {
          const country = state.invoice.country || defaultCountry;
          return {
            invoice: {
              ...invoiceModel,
              ...companyFieldsFromSettings(country),
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
        const { invoice } = useInvoiceStore.getState();
        const country = invoice.country || defaultCountry;
        set({
          invoice: {
            ...invoice,
            ...companyFieldsFromSettings(country),
          },
        });
      },

      applyCountrySettings(country) {
        set((state) => ({
          invoice: {
            ...state.invoice,
            country,
            ...countryFieldsFromSettings(country),
          },
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
            companyPhone: old.companyPhone ?? current.invoice.companyPhone,
            companyWebsite: old.companyWebsite ?? current.invoice.companyWebsite,
            companyLocation: old.companyLocation ?? current.invoice.companyLocation,
            businessNumber: old.businessNumber ?? current.invoice.businessNumber,
            signatureName: old.signatureName ?? current.invoice.signatureName,
            signatureTitle: old.signatureTitle ?? current.invoice.signatureTitle,
            signatureUrl: old.signatureUrl ?? current.invoice.signatureUrl,
            signaturePublicId: old.signaturePublicId ?? current.invoice.signaturePublicId,
            thankYouText: old.thankYouText ?? current.invoice.thankYouText,
            documentCounter: old.documentCounter ?? old.invoiceCounter ?? current.invoice.documentCounter,
            documentNumber: old.documentNumber ?? (String(old.invoiceNumber ?? "") || current.invoice.documentNumber),
          },
          items: persisted.items || current.items,
        };
      },
    },
  ),
);
