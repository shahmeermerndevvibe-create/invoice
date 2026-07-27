import { create } from "zustand";
import { settingsService } from "@/services/InvoiceService";

const settingsDefaults = {
  phoneNo: "+61 421 702 706",
  website: "www.devvibe.com",
  location: "10 Leo Ave, Melbourne, Australia, 3029",
  signatureName: "Ajmal Jillani",
  signatureTitle: "COO - DevVibe",
  thankYouText: "THANK YOU FOR YOUR PAYMENT",
};

export const useSettingsStore = create((set, get) => ({
  ...settingsDefaults,
  loaded: false,

  loadSettings: async () => {
    try {
      const data = await settingsService.getSettings();
      if (data) {
        const { updatedAt, ...settings } = data;
        set({ ...settings, loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },

  updateSettings: (field, value) => {
    set({ [field]: value });
  },

  saveSettings: async () => {
    const { phoneNo, website, location, signatureName, signatureTitle, thankYouText } = get();
    await settingsService.saveSettings({ phoneNo, website, location, signatureName, signatureTitle, thankYouText });
  },

  resetSettings: () => set({ ...settingsDefaults }),
}));
