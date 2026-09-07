"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Globe, Layout, Sparkles } from "lucide-react";

export default function WebsiteDashboardPage() {
  const [template, setTemplate] = useState<"DEFAULT" | "TEMPLATE_A" | "TEMPLATE_B">("DEFAULT");
  const [headline, setHeadline] = useState("Cultivate Stillness, Strength & Breath");
  const [primaryColor, setPrimaryColor] = useState("#4f46e5");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-black text-slate-900">Website Customization</h1>
          <p className="text-sm text-slate-500">Configure your public SSR landing page and design layout.</p>
        </div>
        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition flex items-center gap-2"
        >
          {saved ? <Check className="h-4 w-4" /> : null} {saved ? "Changes Published!" : "Save & Publish"}
        </button>
      </div>

      {/* Template Selector */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Layout className="h-4 w-4 text-indigo-600" /> Choose Website Template
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => setTemplate("DEFAULT")}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition ${
              template === "DEFAULT" ? "border-indigo-600 bg-indigo-50/20" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="h-28 bg-slate-100 rounded-xl mb-3 flex items-center justify-center font-bold text-slate-400">
              Classic Single Page
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Default Profile</h3>
            <p className="text-xs text-slate-500 mt-1">Clean single-page profile with bio, class type filters, and session list.</p>
          </div>

          <div
            onClick={() => setTemplate("TEMPLATE_A")}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition ${
              template === "TEMPLATE_A" ? "border-indigo-600 bg-indigo-50/20" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="h-28 bg-slate-100 rounded-xl mb-3 flex items-center justify-center font-bold text-slate-400">
              Minimalist Grid
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Template A (Studio Plan)</h3>
            <p className="text-xs text-slate-500 mt-1">High-contrast typography, hero focus, and modern class cards.</p>
          </div>

          <div
            onClick={() => setTemplate("TEMPLATE_B")}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition ${
              template === "TEMPLATE_B" ? "border-indigo-600 bg-indigo-50/20" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="h-28 bg-slate-100 rounded-xl mb-3 flex items-center justify-center font-bold text-slate-400">
              Studio Active
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Template B (Studio Plan)</h3>
            <p className="text-xs text-slate-500 mt-1">Vibrant energy, full timetable integration, and instructor highlights.</p>
          </div>
        </div>
      </div>

      {/* Content Form */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">Header & Branding</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Primary Brand Color</label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-16 p-1 rounded-lg border border-slate-300 cursor-pointer"
              />
              <span className="text-xs font-mono text-slate-600">{primaryColor}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
