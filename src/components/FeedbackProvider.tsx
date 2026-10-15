"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { Modal } from "./Modal";

const GLOBAL_TOAST_AUTO_CLOSE_DELAY_MS = 3000;

type Tone = "success" | "error" | "info";
type Confirmation = { title: string; description: string; confirmLabel?: string; destructive?: boolean };
type Toast = { id: number; message: string; tone: Tone };
type Feedback = { notify: (message: string, tone?: Tone, delay?: number) => void; confirm: (options: Confirmation) => Promise<boolean> };
const Context = createContext<Feedback | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const resolver = useRef<((result: boolean) => void) | null>(null);
  const sequence = useRef(0);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const toastRegion = useRef<HTMLDivElement>(null);
  const dismiss = useCallback((id: number) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);
  const notify = useCallback((message: string, tone: Tone = "info", delay: number = GLOBAL_TOAST_AUTO_CLOSE_DELAY_MS) => {
    const id = ++sequence.current;
    setToasts((items) => [...items.slice(-3), { id, message, tone }]);
    // Global auto-close delay of 3 seconds for all toasts on every page
    timers.current.set(id, setTimeout(() => dismiss(id), delay));
  }, [dismiss]);
  const confirm = useCallback((options: Confirmation) => new Promise<boolean>((resolve) => {
    // Prevent rapid double clicks from scheduling the same destructive action twice.
    if (resolver.current) { resolve(false); return; }
    resolver.current = resolve;
    setConfirmation(options);
  }), []);
  const answer = (result: boolean) => {
    resolver.current?.(result); resolver.current = null; setConfirmation(null);
  };
  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    resolver.current?.(false);
  }, []);
  useEffect(() => {
    const region = toastRegion.current;
    // Non-modal popovers stay above native dialogs without stealing focus.
    if (region && typeof region.showPopover === "function") {
      region.setAttribute("popover", "manual");
      if (region.matches(":popover-open")) region.hidePopover();
      if (toasts.length) region.showPopover();
    }
  }, [toasts]);

  return <Context.Provider value={{ notify, confirm }}>
    {children}
    <div ref={toastRegion} className="toast-region" aria-label="Notifications">
      {toasts.map(({ id, message, tone }) => {
        const Icon = tone === "error" ? AlertCircle : tone === "success" ? CheckCircle2 : Info;
        return <div key={id} className={`app-toast toast-${tone}`} role={tone === "error" ? "alert" : "status"}>
          <Icon size={20} className="shrink-0 mt-0.5" aria-hidden="true" />
          <p className="min-w-0 flex-1 text-sm leading-relaxed">{message}</p>
          <button type="button" aria-label="Dismiss notification" onClick={() => dismiss(id)} className="toast-dismiss"><X size={18} /></button>
        </div>;
      })}
    </div>
    {confirmation && <Modal title="" isConfirmation onClose={() => answer(false)} maxWidth="max-w-md">
      <div className="w-full p-6 sm:p-7">
        <h3 className="font-serif text-2xl sm:text-[26px] font-bold text-[#0C2417] leading-snug">{confirmation.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{confirmation.description}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end confirmation-actions">
          <button autoFocus type="button" className="btn-sage px-3.5 py-2 text-xs font-semibold rounded-lg !min-h-0 inline-flex items-center justify-center transition" onClick={() => answer(false)}>Cancel</button>
          <button type="button" className={`rounded-lg px-4 py-2 text-xs font-semibold text-white !min-h-0 inline-flex items-center justify-center transition ${confirmation.destructive ? "bg-red-700 hover:bg-red-800" : "bg-[#133623] hover:bg-[#0C2417]"}`} onClick={() => answer(true)}>{confirmation.confirmLabel || "Confirm"}</button>
        </div>
      </div>
    </Modal>}
  </Context.Provider>;
}

export function useFeedback() {
  const context = useContext(Context);
  if (!context) throw new Error("useFeedback requires FeedbackProvider");
  return context;
}
