"use client";

import { useRef, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/** Keeps optional fields mounted so collapsing never clears their saved values. */
export function AdvancedOptions({ children, description, className = "" }: {
  children: ReactNode;
  description: string;
  className?: string;
}) {
  const disclosure = useRef<HTMLDetailsElement>(null);
  return <details ref={disclosure} className={`group/advanced rounded-xl border border-[#CEDECF] bg-[#F9FAF9] ${className}`}
    onInvalidCapture={() => { if (disclosure.current) disclosure.current.open = true; }}>
    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#133623] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#133623] [&::-webkit-details-marker]:hidden">
      <span>Advanced options<span className="mt-1 block text-xs font-normal text-slate-500">{description}</span></span>
      <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 transition-transform group-open/advanced:rotate-180" />
    </summary>
    <div className="space-y-4 border-t border-[#E1E9E2] p-4">{children}</div>
  </details>;
}
