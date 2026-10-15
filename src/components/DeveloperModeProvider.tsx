"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Code2 } from "lucide-react";

const STORAGE_KEY = "pr_developer_mode";
const DeveloperModeContext = createContext(false);

export function useDeveloperMode() {
  return useContext(DeveloperModeContext);
}

export function DeveloperOnly({ children }: { children: ReactNode }) {
  return useDeveloperMode() ? <>{children}</> : null;
}

export function DeveloperModeProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      setEnabled(localStorage.getItem(STORAGE_KEY) === "on");
    } catch {
      // Keep the toggle usable when browser storage is unavailable.
    }
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        setEnabled(event.key !== null && event.newValue === "on");
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    } catch {
      // In-memory state still works for navigation in this tab.
    }
  };

  return (
    <DeveloperModeContext.Provider value={enabled}>
      {children}
      <button
        type="button"
        onClick={toggle}
        aria-label={`Developer mode ${enabled ? "on" : "off"}`}
        aria-pressed={enabled}
        title={`Developer mode ${enabled ? "on — click to turn off" : "off — click to turn on"}`}
        className={`fixed bottom-4 left-4 z-[60] flex h-10 w-10 items-center justify-center rounded-full border shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#81A882] focus-visible:ring-offset-2 ${enabled ? "border-[#0C2417] bg-[#133623] text-white hover:bg-[#1b4332]" : "border-[#CEDECF] bg-white text-[#7E7970] hover:bg-[#E8F0E9] hover:text-[#133623]"}`}
      >
        <Code2 className="h-4 w-4" aria-hidden="true" />
        {enabled && <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" aria-hidden="true" />}
      </button>
    </DeveloperModeContext.Provider>
  );
}
