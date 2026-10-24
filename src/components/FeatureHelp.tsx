"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

/** A small help icon with a large touch target, available by mouse, touch or keyboard. */
export function FeatureHelp({ label, children }: { label: string; children: string }) {
  const id = useId();
  const anchor = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [position, setPosition] = useState<{ left: number; top: number; above: boolean; width: number } | null>(null);
  const cancelClose = () => { if (timer.current) clearTimeout(timer.current); };
  const open = () => {
    cancelClose();
    const rect = anchor.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(320, window.innerWidth - 24);
    setPosition({ left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)), top: rect.bottom + 210 > window.innerHeight ? rect.top - 8 : rect.bottom + 8, above: rect.bottom + 210 > window.innerHeight, width });
  };
  const closeSoon = () => { cancelClose(); timer.current = setTimeout(() => setPosition(null), 180); };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (!position) return;
    popup.current?.showPopover?.();
    const close = () => setPosition(null);
    const outside = (event: PointerEvent) => {
      if (!anchor.current?.contains(event.target as Node) && !popup.current?.contains(event.target as Node)) close();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(); }
    };
    window.addEventListener("pointerdown", outside);
    window.addEventListener("keydown", escape, true);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("pointerdown", outside);
      window.removeEventListener("keydown", escape, true);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [position]);
  return <>
    <button ref={anchor} type="button" aria-label={`Help: ${label}`} aria-describedby={position ? id : undefined}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-emerald-800 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
      onMouseEnter={open} onMouseLeave={closeSoon} onFocus={open} onBlur={() => setPosition(null)}
      onClick={event => { event.preventDefault(); event.stopPropagation(); open(); }}>
      <Info className="h-4 w-4" aria-hidden="true" />
    </button>
    {position && createPortal(<div ref={popup} id={id} role="tooltip" popover="manual"
      onMouseEnter={cancelClose} onMouseLeave={closeSoon}
      className="fixed z-[1000] rounded-xl border border-emerald-200 bg-white p-4 text-left text-sm leading-relaxed text-slate-700 shadow-xl"
      style={{ margin: 0, right: "auto", bottom: "auto", left: position.left, top: position.top, width: position.width, transform: position.above ? "translateY(-100%)" : undefined }}>
      <p className="mb-1 font-semibold text-emerald-950">{label}</p><p>{children}</p>
    </div>, anchor.current?.closest("dialog") || document.body)}
  </>;
}
