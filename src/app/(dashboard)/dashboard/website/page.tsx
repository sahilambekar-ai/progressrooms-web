"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Globe, Layout, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { useFeedback } from "@/components/FeedbackProvider";

export default function WebsiteDashboardPage() {
  const [template, setTemplate] = useState<"DEFAULT" | "TEMPLATE_A" | "TEMPLATE_B">("DEFAULT");
  const [headline, setHeadline] = useState("Cultivate Stillness, Strength & Breath");
  const [primaryColor, setPrimaryColor] = useState("#133623");
  const [saved, setSaved] = useState(false);

  const { notify, confirm } = useFeedback();
  useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem("pr_website_draft") || "null");
      if (draft) {
        if (["DEFAULT", "TEMPLATE_A", "TEMPLATE_B"].includes(draft.template)) setTemplate(draft.template);
        if (typeof draft.headline === "string") setHeadline(draft.headline);
        if (/^#[0-9a-f]{6}$/i.test(draft.primaryColor)) setPrimaryColor(draft.primaryColor);
      }
    } catch { notify("Your saved website draft could not be loaded.", "error"); }
  }, [notify]);

  const handleSave = async () => {
    if (!headline.trim()) { notify("Add a headline before saving your draft.", "error"); return; }
    if (!await confirm({ title: "Save website draft?", description: "This saves your design on this device. It does not publish changes to your live studio website.", confirmLabel: "Save draft" })) return;
    try {
      localStorage.setItem("pr_website_draft", JSON.stringify({ template, headline, primaryColor }));
      setSaved(true);
      notify("Website draft saved on this device.", "success");
    } catch { notify("Your draft could not be saved. Check your browser storage and try again.", "error"); }
  };

  return (
    <main id="main-content" className="min-h-screen w-full bg-[#FAF7F2] p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      <BrandLogo size={36} showText />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-black text-slate-900">Website Customization</h1>
          <p className="text-sm text-slate-500">Design your studio’s public website and save a draft on this device.</p>
        </div>
        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-[#133623] hover:bg-[#0C2417] text-white font-semibold text-sm shadow-md transition flex items-center gap-2"
        >
          {saved ? <Check className="h-4 w-4" /> : null} {saved ? "Draft Saved" : "Save Draft"}
        </button>
      </div>

      {/* Template Selector */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Layout className="h-4 w-4 text-[#133623]" /> Choose Website Template
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button type="button" aria-pressed={template === "DEFAULT"}
            onClick={() => { setTemplate("DEFAULT"); setSaved(false); }}
            className={`text-left p-5 rounded-2xl border-2 cursor-pointer transition ${
              template === "DEFAULT" ? "border-[#133623] bg-[#E8F0E9]" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="h-28 bg-slate-100 rounded-xl mb-3 flex items-center justify-center font-bold text-slate-400">
              Classic Single Page
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Default Profile</h3>
            <p className="text-xs text-slate-500 mt-1">Clean single-page profile with bio, class type filters, and session list.</p>
          </button>

          <button type="button" aria-pressed={template === "TEMPLATE_A"}
            onClick={() => { setTemplate("TEMPLATE_A"); setSaved(false); }}
            className={`text-left p-5 rounded-2xl border-2 cursor-pointer transition ${
              template === "TEMPLATE_A" ? "border-[#133623] bg-[#E8F0E9]" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="h-28 bg-slate-100 rounded-xl mb-3 flex items-center justify-center font-bold text-slate-400">
              Minimalist Grid
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Template A (Studio Plan)</h3>
            <p className="text-xs text-slate-500 mt-1">High-contrast typography, hero focus, and modern class cards.</p>
          </button>

          <button type="button" aria-pressed={template === "TEMPLATE_B"}
            onClick={() => { setTemplate("TEMPLATE_B"); setSaved(false); }}
            className={`text-left p-5 rounded-2xl border-2 cursor-pointer transition ${
              template === "TEMPLATE_B" ? "border-[#133623] bg-[#E8F0E9]" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="h-28 bg-slate-100 rounded-xl mb-3 flex items-center justify-center font-bold text-slate-400">
              Studio Active
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Template B (Studio Plan)</h3>
            <p className="text-xs text-slate-500 mt-1">Vibrant energy, full timetable integration, and instructor highlights.</p>
          </button>
        </div>
      </div>

      {/* Content Form */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">Header & Branding</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="website-page-field-1" className="block text-xs font-bold text-slate-700 uppercase mb-1">Headline</label>
            <input id="website-page-field-1"
              type="text"
              value={headline}
              onChange={(e) => { setHeadline(e.target.value); setSaved(false); }}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#133623] text-sm"
            />
          </div>
          <div>
            <label htmlFor="website-color" className="block text-xs font-bold text-slate-700 uppercase mb-1">Primary Brand Color</label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                id="website-color"
                value={primaryColor}
                onChange={(e) => { setPrimaryColor(e.target.value); setSaved(false); }}
                className="h-10 w-16 p-1 rounded-lg border border-slate-300 cursor-pointer"
              />
              <span className="text-xs font-mono text-slate-600">{primaryColor}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
