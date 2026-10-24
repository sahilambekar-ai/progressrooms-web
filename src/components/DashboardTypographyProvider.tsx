"use client";

import { createContext, useContext, useEffect, useState, type ReactNode, type CSSProperties } from "react";
import { staffApi } from "@/lib/staff-api";
import { Manrope, DM_Sans, IBM_Plex_Sans, Source_Sans_3, Source_Serif_4 } from "next/font/google";

const manrope = Manrope({ subsets: ["latin"], display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], display: "swap" });
const ibmPlex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });
const sourceSans = Source_Sans_3({ subsets: ["latin"], display: "swap" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], display: "swap" });

export const dashboardFonts = [
  { id: "lora", name: "Lora", description: "Warm, elegant serif", family: "var(--font-lora), 'Lora', Georgia, serif" },
  { id: "manrope", name: "Manrope", description: "Modern, geometric and precise", family: manrope.style.fontFamily },
  { id: "dm-sans", name: "DM Sans", description: "Clean, balanced and approachable", family: dmSans.style.fontFamily },
  { id: "ibm-plex", name: "IBM Plex Sans", description: "Distinctive, structured and professional · default", family: ibmPlex.style.fontFamily },
  { id: "source-sans", name: "Source Sans 3", description: "Clear and readable for busy dashboards", family: sourceSans.style.fontFamily },
  { id: "source-serif", name: "Source Serif 4", description: "Refined editorial style with strong readability", family: sourceSerif.style.fontFamily },
] as const;

type FontId = typeof dashboardFonts[number]["id"];
const TypographyContext = createContext({ font: "ibm-plex" as FontId, selectFont: (_font: FontId) => {}, loading: true, saving: false, error: "" });
export const useDashboardTypography = () => useContext(TypographyContext);

export function DashboardTypographyProvider({ children }: { children: ReactNode }) {
  const [font, setFont] = useState<FontId>("ibm-plex");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!localStorage.getItem("pr_access_token")) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const data = await staffApi("/auth/me/preferences", { cache: "no-store" });
        if (!cancelled) setFont(dashboardFonts.find(option => option.id === data.dashboard_font)?.id || "ibm-plex");
      } catch {
        if (!cancelled) setError("Your saved font could not be loaded. Reload to try again.");
      } finally { if (!cancelled) setLoading(false); }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const family = dashboardFonts.find(option => option.id === font)!.family;
  useEffect(() => {
    // Body-level dialogs and notifications use the same dashboard preference.
    const previous = document.body.style.getPropertyValue("--font-ui");
    document.body.style.setProperty("--font-ui", family);
    return () => {
      if (previous) document.body.style.setProperty("--font-ui", previous);
      else document.body.style.removeProperty("--font-ui");
    };
  }, [family]);

  const selectFont = async (next: FontId) => {
    if (loading || saving) return;
    const previous = font;
    setFont(next); setSaving(true); setError("");
    try {
      await staffApi("/auth/me/preferences", { method: "PATCH", body: JSON.stringify({ dashboard_font: next }) });
    } catch {
      setFont(previous);
      setError("Your font could not be saved. Please try again.");
    } finally { setSaving(false); }
  };

  return <TypographyContext.Provider value={{ font, selectFont, loading, saving, error }}>
    <div style={{ display: "contents", "--font-ui": family } as CSSProperties}>{loading ? <div role="status" className="p-8">Loading your workspace…</div> : children}</div>
  </TypographyContext.Provider>;
}
