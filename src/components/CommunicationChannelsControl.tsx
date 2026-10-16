"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Radio } from "lucide-react";
import { useDeveloperMode } from "./DeveloperModeProvider";
import { PanelLoading } from "./PanelLoading";

const CommunicationChannelsPanel = dynamic(() => import("./CommunicationChannelsPanel").then(module => module.CommunicationChannelsPanel), { loading: PanelLoading });

export function CommunicationChannelsControl() {
  const isDevMode = useDeveloperMode();
  const [isOpen, setIsOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("pr_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.role === "SUPER_ADMIN" || parsed.is_superadmin) {
          setIsSuperAdmin(true);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  // Only render if user is Super Admin or Developer Mode is enabled
  if (!isSuperAdmin && !isDevMode) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button beside Developer Mode button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Platform Communication Channels"
        title="Platform Communication Channels (Applies to all studios)"
        className="fixed bottom-4 left-16 z-[60] flex h-10 w-10 items-center justify-center rounded-full border border-[#CEDECF] bg-white text-[#133623] shadow-md hover:bg-[#E8F0E9] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#81A882] focus-visible:ring-offset-2"
      >
        <Radio className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* Interactive Modal Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <CommunicationChannelsPanel onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
}
