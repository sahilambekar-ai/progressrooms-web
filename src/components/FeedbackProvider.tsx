"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { Modal } from "./Modal";

type Tone = "success" | "error" | "info";
type Confirmation = { title: string; description: string; confirmLabel?: string; destructive?: boolean };
type Toast = { id: number; message: string; tone: Tone };
type Feedback = { notify: (message: string, tone?: Tone) => void; confirm: (options: Confirmation) => Promise<boolean> };
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
  const notify = useCallback((message: string, tone: Tone = "info") => {
    const id = ++sequence.current;
    setToasts((items) => [...items.slice(-3), { id, message, tone }]);
    // Errors remain available until dismissed, so slower readers don't miss them.
    if (tone !== "error") timers.current.set(id, setTimeout(() => dismiss(id), 7000));
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
    {confirmation && <Modal title={confirmation.title} onClose={() => answer(false)}>
      <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-7">
        <div className={`mb-4 inline-flex rounded-2xl p-3 ${confirmation.destructive ? "bg-red-50 text-red-700" : "bg-[#E8F0E9] text-[#1b4332]"}`}><AlertCircle size={24} /></div>
        <h3 className="text-2xl font-bold">{confirmation.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{confirmation.description}</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button autoFocus type="button" className="btn-sage px-5 py-3" onClick={() => answer(false)}>Cancel</button>
          <button type="button" className={`rounded-xl px-5 py-3 font-semibold text-white ${confirmation.destructive ? "bg-red-700 hover:bg-red-800" : "bg-[#133623] hover:bg-[#0C2417]"}`} onClick={() => answer(true)}>{confirmation.confirmLabel || "Confirm"}</button>
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
