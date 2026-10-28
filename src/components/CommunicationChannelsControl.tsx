"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Mail } from "lucide-react";
import { CommunicationChannelsPanel } from "./CommunicationChannelsPanel";
import { Modal } from "./Modal";

export function CommunicationChannelsControl() {
  const [open, setOpen] = useState(false);
  return <>
    <button data-developer-mode type="button" onClick={() => setOpen(true)} aria-label="Email notification settings" title="Email notification settings" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#CEDECF] bg-white text-[#133623] shadow-md"><Mail size={16} /></button>
    {open && createPortal(<Modal title="Email notifications" maxWidth="max-w-2xl" onClose={() => setOpen(false)}><CommunicationChannelsPanel isEmbedded inModal onClose={() => setOpen(false)} /></Modal>, document.body)}
  </>;
}
