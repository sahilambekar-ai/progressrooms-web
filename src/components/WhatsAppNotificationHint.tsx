"use client";

import { useEffect, useId, useRef, useState, type SVGProps } from "react";
import { createPortal } from "react-dom";
import { useCommunicationSettings } from "@/components/CommunicationSettingsProvider";

export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.5 3.5A11.8 11.8 0 0 0 2 17.7L.4 23.6l6-1.6A11.8 11.8 0 0 0 24 11.8c0-3.1-1.2-6.1-3.5-8.3ZM12.2 21.6a9.7 9.7 0 0 1-5-1.4l-.4-.2-3.6.9 1-3.5-.3-.4A9.8 9.8 0 1 1 12.2 21.6Zm5.4-7.3c-.3-.2-1.7-.9-2-.9-.3-.1-.5-.2-.7.1l-.9 1.1c-.2.2-.3.2-.6.1a8 8 0 0 1-3.9-3.4c-.3-.4.3-.4.8-1.5.1-.2 0-.4 0-.5l-.9-2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 5 4.4 1.8.8 2.5.9 3.4.8.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4Z" />
    </svg>
  );
}

const details = {
  reminder: "Progress Rooms Classes: reminders for eligible enrolled students and assigned teachers, 2 hours and 15 minutes before class. Includes the latest time, teacher and class-access link. Join 5 minutes early.",
  changes: "Progress Rooms Classes: routine edits before the first reminder are combined into the scheduled reminders. Important changes after a reminder require a consolidated correction; cancellations require a prompt notice.",
  payment: "Progress Rooms Admin: payment confirmation for the purchasing student after payment is verified. Includes the studio, amount and receipt details. Retrying payment confirmation must not send duplicates.",
  billing: "Progress Rooms Admin: studio billing contacts receive invoices, payment-due reminders, overdue notices and payment confirmations. Paid invoices must not receive further due reminders.",
  contact: "This is a recipient number, not a sending account. Progress Rooms uses its Classes number for class notices and its Admin number for billing notices. A valid Indian number and recipient consent are required.",
  channels: "The WhatsApp switch applies to both Progress Rooms sender numbers across all studios. Delivery also requires a configured sender, an approved template, recipient consent and an available allowance.",
  test: "A test targets the selected Progress Rooms WhatsApp sender and recipient. The current implementation simulates WhatsApp tests; a successful simulation does not mean a message was delivered.",
} as const;

export function WhatsAppNotificationHint({
  kind = "reminder",
  className = "",
  description,
}: {
  kind?: keyof typeof details;
  className?: string;
  description?: string;
}) {
  const { whatsappCompletelyDisabled } = useCommunicationSettings();
  const id = useId();
  const anchor = useRef<HTMLButtonElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [position, setPosition] = useState<{ left: number; top: number; above: boolean; width: number } | null>(null);
  const text = description || details[kind];

  function open() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    const rect = anchor.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(304, window.innerWidth - 24);
    const above = rect.bottom + 240 > window.innerHeight;
    setPosition({
      left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)),
      top: above ? rect.top - 8 : rect.bottom + 8,
      above,
      width,
    });
  }

  function closeSoon() {
    closeTimer.current = setTimeout(() => setPosition(null), 150);
  }

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  useEffect(() => {
    if (position && tooltip.current && !tooltip.current.matches(":popover-open")) {
      tooltip.current.showPopover?.();
    }
  }, [position]);

  useEffect(() => {
    if (!position) return;
    const close = () => setPosition(null);
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(); } };
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    window.addEventListener("pointerdown", close);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("pointerdown", close);
    };
  }, [position]);

  if (whatsappCompletelyDisabled) {
    return null;
  }

  return (
    <>
      <button
        ref={anchor}
        data-whatsapp-hint=""
        type="button"
        aria-label={`WhatsApp notification details: ${text} Delivery setup pending.`}
        aria-describedby={position ? id : undefined}
        onMouseEnter={open}
        onMouseLeave={closeSoon}
        onFocus={open}
        onBlur={() => setPosition(null)}
        onClick={(event) => { event.preventDefault(); event.stopPropagation(); open(); }}
        className={`absolute right-2 top-2 z-10 !m-0 block h-4 w-4 cursor-help border-0 bg-transparent p-0 text-emerald-600 hover:text-emerald-800 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${className}`}
      >
        <WhatsAppIcon className="block h-full w-full" />
      </button>
      {position && createPortal(
        <div
          ref={tooltip}
          popover="manual"
          id={id}
          role="tooltip"
          onMouseEnter={() => { if (closeTimer.current) clearTimeout(closeTimer.current); }}
          onMouseLeave={closeSoon}
          className="fixed z-[1000] rounded-xl border border-[#CEDECF] bg-white p-3 text-left text-xs leading-relaxed text-[#243c30] shadow-xl"
          style={{ margin: 0, right: "auto", bottom: "auto", left: position.left, top: position.top, width: position.width, transform: position.above ? "translateY(-100%)" : undefined }}
        >
          <p className="mb-1 flex items-center gap-2 font-bold"><WhatsAppIcon className="h-4 w-4 text-emerald-700" />WhatsApp notification details</p>
          <p>{text}</p>
          <p className="mt-2 border-t border-[#E1E9E2] pt-2 text-[11px] text-amber-800">Planned behavior · delivery setup pending. This icon does not confirm a message was sent.</p>
        </div>, anchor.current?.closest("dialog") || document.body,
      )}
    </>
  );
}
