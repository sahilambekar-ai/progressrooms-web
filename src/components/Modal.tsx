"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/** Native dialogs provide focus containment, Escape handling and focus restoration. */
export function Modal({ open = true, onClose, title, children, confirmDiscard = false }: {
  open?: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  confirmDiscard?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
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

  function requestClose() {
    if (confirmDiscard && dirty) setDiscard(true);
    else onClose();
  }

  return (
    <dialog ref={ref} aria-labelledby={id} className="app-dialog"
      onCancel={(event) => { event.preventDefault(); requestClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) requestClose(); }}>
      <div className="dialog-surface" onChangeCapture={() => setDirty(true)}
        onClickCapture={(event) => {
          const button = (event.target as HTMLElement).closest("button");
          if (button?.hasAttribute("aria-pressed") && button.closest("form")) setDirty(true);
          if (button && /^(cancel|close)/i.test(button.textContent?.trim() || button.getAttribute("aria-label") || "")) {
            event.preventDefault(); event.stopPropagation(); requestClose();
          }
        }}>
        <h2 id={id} className="sr-only">{title}</h2>
        {children}
        {discard && <div className="discard-prompt" role="alert">
          <p className="font-semibold">Discard unsaved changes?</p>
          <p className="mt-1 text-sm text-slate-600">Your changes in this dialog haven’t been saved.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" autoFocus className="btn-sage px-4 py-2" onClick={() => setDiscard(false)}>Keep editing</button>
            <button type="button" className="rounded-xl bg-red-700 px-4 py-2 text-white" onClick={onClose}>Discard changes</button>
          </div>
        </div>}
      </div>
    </dialog>
  );
}
