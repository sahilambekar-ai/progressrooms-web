"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Code2 } from "lucide-react";

const STORAGE_KEY = "pr_developer_mode";
const DeveloperModeContext = createContext({ available: false, enabled: false, toggle: () => {} });

export function useDeveloperMode() {
  return useContext(DeveloperModeContext).enabled;
}

export function DeveloperOnly({ children }: { children: ReactNode }) {
  return useDeveloperMode() ? <span data-developer-mode style={{ display: "contents" }}>{children}</span> : null;
}

export function DeveloperModeProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const localHost = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
    const localBuild = process.env.NODE_ENV === "development" && (!process.env.NEXT_PUBLIC_APP_ENV || process.env.NEXT_PUBLIC_APP_ENV === "dev");
    if (!localHost || !localBuild) return;
    setAvailable(true);
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
    if (!available) return;
    const next = !enabled;
    setEnabled(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    } catch {
      // In-memory state still works for navigation in this tab.
    }
  };

  return <DeveloperModeContext.Provider value={{ available, enabled: available && enabled, toggle }}>{children}</DeveloperModeContext.Provider>;
}

export function DeveloperControls({ children }: { children: ReactNode }) {
  const { available, enabled, toggle } = useContext(DeveloperModeContext);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !box.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  if (!available) return null;
  return <div ref={box} data-developer-mode
    className="fixed bottom-4 left-4 z-[60] flex items-center gap-2"
    onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
    onFocus={() => setOpen(true)}>
      <button
        type="button"
        data-developer-mode
        onClick={toggle}
        aria-expanded={open}
        aria-controls="developer-channel-controls"
        aria-label={`Developer mode ${enabled ? "on" : "off"}`}
        aria-pressed={enabled}
        title={`Developer mode ${enabled ? "on" : "off"} — click to toggle`}
        className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#81A882] focus-visible:ring-offset-2 ${enabled ? "border-[#0C2417] bg-[#133623] text-white hover:bg-[#1b4332]" : "border-[#CEDECF] bg-white text-[#7E7970] hover:bg-[#E8F0E9] hover:text-[#133623]"}`}
      >
        <Code2 className="h-4 w-4" aria-hidden="true" />
        {enabled && <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" aria-hidden="true" />}
      </button>
    <div id="developer-channel-controls" hidden={!open}>{children}</div>
  </div>;
}
