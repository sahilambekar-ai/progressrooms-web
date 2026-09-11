"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { Modal } from "./Modal";

export function ResponsiveSidebar({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(true);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    const update = () => { setCompact(media.matches); if (!media.matches) setOpen(false); };
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const content = <div className="sidebar-content" onClick={(event) => {
    if ((event.target as HTMLElement).closest("nav button, a")) setOpen(false);
  }}>{children}</div>;
  return <>
    <header className="dashboard-mobile-header">
      <BrandLogo size={32} showText subtitle="Your studio, anywhere" />
      <button ref={trigger} type="button" aria-label="Open navigation" aria-expanded={open} aria-haspopup="dialog" className="btn-sage p-3" onClick={() => setOpen(true)}><Menu size={22} /></button>
    </header>
    {!compact && content}
    {compact && open && <Modal title="Studio navigation" onClose={() => { setOpen(false); trigger.current?.focus(); }}>
      <div className="mobile-navigation">
        <button type="button" aria-label="Close navigation" className="navigation-close" onClick={() => setOpen(false)}><X size={22} /></button>
        {content}
      </div>
    </Modal>}
  </>;
}
