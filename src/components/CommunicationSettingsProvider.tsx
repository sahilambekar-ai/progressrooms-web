"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

const STORAGE_KEY_WA_SERVICE = "pr_whatsapp_service_enabled";
const STORAGE_KEY_WA_COMPLETELY = "pr_whatsapp_completely_disabled";
const STORAGE_KEY_EMAIL_SERVICE = "pr_email_service_enabled";
const EVENT_SETTINGS_CHANGED = "pr_communication_settings_changed";

export interface CommunicationSettingsContextType {
  whatsappServiceEnabled: boolean;
  whatsappCompletelyDisabled: boolean;
  emailServiceEnabled: boolean;
  toggleWhatsAppService: (val?: boolean) => void;
  toggleWhatsAppCompletely: (val?: boolean) => void;
  toggleEmailService: (val?: boolean) => void;
}

const CommunicationSettingsContext = createContext<CommunicationSettingsContextType>({
  whatsappServiceEnabled: false,
  whatsappCompletelyDisabled: true,
  emailServiceEnabled: true,
  toggleWhatsAppService: () => {},
  toggleWhatsAppCompletely: () => {},
  toggleEmailService: () => {},
});

export function useCommunicationSettings() {
  return useContext(CommunicationSettingsContext);
}

export function CommunicationSettingsProvider({ children }: { children: ReactNode }) {
  const [whatsappServiceEnabled, setWhatsappServiceEnabled] = useState<boolean>(false);
  const [whatsappCompletelyDisabled, setWhatsappCompletelyDisabled] = useState<boolean>(true);
  const [emailServiceEnabled, setEmailServiceEnabled] = useState<boolean>(true);

  // Synchronize local storage to state
  const syncFromStorage = useCallback(() => {
    try {
      const emailService = localStorage.getItem(STORAGE_KEY_EMAIL_SERVICE);

      setWhatsappServiceEnabled(false);
      setWhatsappCompletelyDisabled(true);
      if (emailService !== null) setEmailServiceEnabled(emailService === "true");
    } catch {
      // Local storage not available
    }
  }, []);

  useEffect(() => {
    syncFromStorage();

    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === STORAGE_KEY_WA_SERVICE ||
        e.key === STORAGE_KEY_WA_COMPLETELY ||
        e.key === STORAGE_KEY_EMAIL_SERVICE ||
        e.key === null
      ) {
        syncFromStorage();
      }
    };

    const handleCustom = () => {
      syncFromStorage();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(EVENT_SETTINGS_CHANGED, handleCustom);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(EVENT_SETTINGS_CHANGED, handleCustom);
    };
  }, [syncFromStorage]);

  const toggleWhatsAppService = useCallback(() => { setWhatsappServiceEnabled(false); }, []);
  const toggleWhatsAppCompletely = useCallback(() => { setWhatsappCompletelyDisabled(true); }, []);

  const toggleEmailService = useCallback((val?: boolean) => {
    const next = val !== undefined ? val : (localStorage.getItem(STORAGE_KEY_EMAIL_SERVICE) ?? "true") !== "true";
    setEmailServiceEnabled(next);
    try {
      localStorage.setItem(STORAGE_KEY_EMAIL_SERVICE, String(next));
      window.dispatchEvent(new CustomEvent(EVENT_SETTINGS_CHANGED));
    } catch {
      // ignore
    }
  }, []);

  return (
    <CommunicationSettingsContext.Provider
      value={{
        whatsappServiceEnabled,
        whatsappCompletelyDisabled,
        emailServiceEnabled,
        toggleWhatsAppService,
        toggleWhatsAppCompletely,
        toggleEmailService,
      }}
    >
      {children}
    </CommunicationSettingsContext.Provider>
  );
}
