import { create } from "zustand";
import { settingsService } from "@/services/InvoiceService";

const COUNTRY_PLACEHOLDERS = {
  Australia: {
    phoneNo: "+61 421 702 706",
    website: "www.devvibe.com",
    location: "10 Leo Ave, Melbourne, Australia, 3029",
    signatureName: "Ajmal Jillani",
    signatureTitle: "COO - DevVibe",
    thankYouText: "THANK YOU FOR YOUR PAYMENT",
  },
  Pakistan: {
    phoneNo: "+92 300 1234567",
    website: "www.devvibe.com",
    location: "5 Main Blvd, Karachi, Pakistan",
    signatureName: "Ajmal Jillani",
    signatureTitle: "COO - DevVibe",
    thankYouText: "THANK YOU FOR YOUR PAYMENT",
  },
  USA: {
    phoneNo: "+1 212 555 0198",
    website: "www.devvibe.com",
    location: "123 Broadway, New York, NY 10006",
    signatureName: "Ajmal Jillani",
    signatureTitle: "COO - DevVibe",
    thankYouText: "THANK YOU FOR YOUR PAYMENT",
  },
};

const buildDefaultByCountry = () => {
  const byCountry = {};
  for (const [country, defaults] of Object.entries(COUNTRY_PLACEHOLDERS)) {
    byCountry[country] = { ...defaults };
  }
  return byCountry;
};

export const useSettingsStore = create((set, get) => ({
  byCountry: buildDefaultByCountry(),
  loaded: false,

  getCurrentSettings: (country) => {
    return get().byCountry[country] || COUNTRY_PLACEHOLDERS[country] || {};
  },

  loadSettings: async () => {
    try {
      const data = await settingsService.getSettings();
      if (data) {
        const { updatedAt, ...settings } = data;
        if (settings.byCountry) {
          const merged = buildDefaultByCountry();
          for (const [country, values] of Object.entries(settings.byCountry)) {
            merged[country] = { ...merged[country], ...values };
          }
          set({ byCountry: merged, loaded: true });
        } else {
          const { updatedAt: _, ...flat } = data;
          if (flat.phoneNo || flat.website || flat.location) {
            const merged = buildDefaultByCountry();
            for (const country of Object.keys(merged)) {
              merged[country] = { ...merged[country], ...flat };
            }
            set({ byCountry: merged, loaded: true });
          } else {
            set({ loaded: true });
          }
        }
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }

    const { useInvoiceStore } = await import("@/store/invoiceStore");
    useInvoiceStore.getState().syncCompanyFieldsFromSettings();
  },

  updateSettings: (country, field, value) => {
    set((state) => ({
      byCountry: {
        ...state.byCountry,
        [country]: {
          ...(state.byCountry[country] || {}),
          [field]: value,
        },
      },
    }));
  },

  saveSettings: async () => {
    const { byCountry } = get();
    await settingsService.saveSettings({ byCountry });
  },

  resetSettings: () => set({ byCountry: buildDefaultByCountry() }),
}));