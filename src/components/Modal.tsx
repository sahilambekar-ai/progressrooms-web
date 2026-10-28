"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronsDown, X } from "lucide-react";

// Shared dialog sizes are 15% wider than the corresponding Tailwind defaults.
const modalWidths: Record<string, string> = {
  "max-w-md": "max-w-[32.2rem]",
  "max-w-xl": "max-w-[41.4rem]",
  "max-w-2xl": "max-w-[48.3rem]",
};

/** Native dialogs provide focus containment, Escape handling and focus restoration. */
export function Modal({
  open = true,
  onClose,
  title,
  subtitle,
  children,
  footer,
  confirmDiscard = false,
  isConfirmation = false,
  maxWidth = "max-w-xl",
}: {
  open?: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  confirmDiscard?: boolean;
  isConfirmation?: boolean;
  maxWidth?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const bodyId = useId();
  const scrollBody = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [moreBelow, setMoreBelow] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [discard, setDiscard] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (open && dialog && !dialog.open) {
      setDirty(false);
      setDiscard(false);
      dialog.showModal();
    } else if (!open && dialog?.open) dialog.close();
    return () => {
      if (dialog?.open) dialog.close();
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const body = scrollBody.current;
    if (!body) return;
    const update = () => setMoreBelow(body.scrollHeight - body.clientHeight - body.scrollTop > 8);
    update();
    body.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(body);
    if (content.current) observer.observe(content.current);
    return () => { body.removeEventListener("scroll", update); observer.disconnect(); };
  }, [open]);

  function requestClose() {
    if (confirmDiscard && dirty) setDiscard(true);
    else onClose();
  }

  const showHeader = Boolean(title && !isConfirmation);
  const actions = footer === undefined ? <div className="flex justify-end"><button type="button" onClick={requestClose} className="rounded-xl border border-[#CEDECF] px-4 py-2 text-sm font-semibold text-[#133623]">Close</button></div> : footer;

  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      className="app-dialog"
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const nodes = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')).filter(node => node.getClientRects().length > 0);
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (!first) { event.preventDefault(); return; }
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }}
      onCancel={(event) => { event.preventDefault(); requestClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) requestClose(); }}
    >
      <div
        className={`dialog-surface relative w-full ${modalWidths[maxWidth] || maxWidth} mx-auto rounded-3xl bg-white shadow-2xl border border-[#CEDECF] overflow-hidden`}
        onChangeCapture={() => setDirty(true)}
        onClickCapture={(event) => {
          const button = (event.target as HTMLElement).closest("button");
          if (button?.hasAttribute("aria-pressed") && button.closest("form")) setDirty(true);
          if (button && /^(cancel|close)/i.test(button.textContent?.trim() || button.getAttribute("aria-label") || "")) {
            event.preventDefault(); event.stopPropagation(); requestClose();
          }
        }}
      >
        {showHeader ? (
          <div className="dialog-header bg-gradient-to-r from-[#0C2417] to-[#1b4332] px-6 py-4 text-white border-b border-[#1f5434] w-full shrink-0">
            <div className="pr-4">
              <h2 id={id} className="font-serif font-bold text-xl sm:text-2xl text-white leading-snug">
                {title}
              </h2>
              {subtitle && <p className="text-xs text-[#d7e8d8] mt-0.5">{subtitle}</p>}
            </div>
            <button
              type="button"
              aria-label="Close modal"
              onClick={requestClose}
              className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <h2 id={id} className="sr-only">{title}</h2>
        )}

        <div className="dialog-scroll-region">
          <div ref={scrollBody} id={bodyId} className="dialog-body" role="region" tabIndex={0} aria-label="Dialog content">
            <div ref={content} className="dialog-content">{children}</div>
          </div>
          {moreBelow && <button type="button" className="dialog-scroll-hint"
            aria-label="More options below — scroll to bottom" aria-controls={bodyId}
            title="More options below — scroll to bottom"
            onClick={() => scrollBody.current?.scrollTo({
              top: scrollBody.current.scrollHeight,
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
            })}>
            <ChevronsDown aria-hidden="true" className="h-5 w-5 motion-safe:animate-bounce" />
          </button>}
        </div>
        {actions && <div className="dialog-footer">{actions}</div>}

        {discard && (
          <div className="discard-prompt" role="alert" onClick={(e) => e.stopPropagation()}>
            <div className="discard-prompt-card" onClick={(e) => e.stopPropagation()}>
              <h4 className="font-serif text-xl font-bold text-[#0C2417]">Discard unsaved changes?</h4>
              <p className="mt-1.5 text-sm text-slate-600">Your changes in this dialog haven’t been saved.</p>
              <div className="mt-4 flex flex-wrap gap-2 justify-end confirmation-actions">
                <button
                  type="button"
                  autoFocus
                  className="btn-sage px-3.5 py-1.5 text-xs font-semibold rounded-lg !min-h-0 inline-flex items-center justify-center transition"
                  onClick={() => setDiscard(false)}
                >
                  Keep editing
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-red-700 px-3.5 py-1.5 text-xs font-semibold text-white !min-h-0 inline-flex items-center justify-center hover:bg-red-800 transition"
                  onClick={onClose}
                >
                  Discard changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}
