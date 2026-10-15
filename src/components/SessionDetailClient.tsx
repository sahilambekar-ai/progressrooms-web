"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Clock, Users, Shield, ArrowLeft, CheckCircle2, AlertCircle, MapPin, Video, ShieldCheck } from "lucide-react";
import { PublicSessionDetailPayload } from "@/types";
import { EnrollmentModal } from "@/components/EnrollmentModal";
import { BrandLogo } from "@/components/BrandLogo";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function SessionDetailClient({ session }: { session: PublicSessionDetailPayload }) {
  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => { if (new URLSearchParams(window.location.search).get('buy')) setModalOpen(true); }, []);

  const nextDateFormatted = session.next_occurrence ? new Date(session.next_occurrence.start_time).toLocaleString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: session.organization.timezone || "Asia/Kolkata"
  }) : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Breadcrumb Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/${session.organization.slug}/explore`}
            className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to {session.organization.name}
          </Link>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
            {session.class_type || "Scheduled Class"}
          </span>
        </div>
      </header>

      <main id="main-content" className="max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#E8F0E9] text-[#133623]">
                  {session.session_type}
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-900 border border-blue-200">
                  {session.delivery_mode === "ONLINE_LIVE" ? "Online Live (Zoom)" : session.delivery_mode === "IN_STUDIO" ? "In-Studio Sanctuary" : "Hybrid Live & Studio"}
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                  {session.skill_level}
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                  {session.duration_minutes} Mins
                </span>
                {session.availability && (
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    session.availability.remaining_spots > 3 ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}>
                    {session.availability.remaining_spots} spots left
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {session.name}
              </h1>

              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                {session.full_description || session.short_description}
              </p>

              {nextDateFormatted && (
                <div className="mt-5 p-3.5 rounded-2xl bg-[#E8F0E9] border border-[#CEDECF] text-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#133623] shrink-0" />
                    <span className="text-[#0C2417] font-medium">
                      <strong>Next Upcoming Class:</strong> {nextDateFormatted} ({session.organization.timezone})
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 bg-white/90 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    Open for Booking
                  </span>
                </div>
              )}
            </div>

            {/* Venue & Delivery Mode Card */}
            <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#133623]" /> Venue & Classroom Delivery
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Inherited Studio Location Policy
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">Delivery Format</span>
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    {session.delivery_mode === "ONLINE_LIVE" ? <Video className="h-4 w-4 text-blue-600" /> : <MapPin className="h-4 w-4 text-emerald-600" />}
                    {session.delivery_mode === "ONLINE_LIVE" ? "Online Live (Zoom)" : session.delivery_mode === "IN_STUDIO" ? "In-Studio Sanctuary" : "Hybrid Live & In-Studio"}
                  </span>
                  <p className="text-slate-600 text-[11px] pt-1">
                    {session.meeting_readiness || "Live Zoom meeting room link activates in your Student Portal 15 minutes before scheduled start time."}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">Location / Host</span>
                  <span className="font-bold text-slate-900 text-sm block">{session.venue?.name || session.organization.name}</span>
                  <p className="text-slate-600 text-[11px] pt-1">{session.venue?.address || `${session.organization.name} Studio, Bengaluru`}</p>
                </div>
              </div>
            </div>

            {/* Weekly Schedule */}
            <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-[#133623]" /> Weekly Class Schedule
              </h2>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                {session.schedule.map((r, i) => (
                  <div key={i} className="p-4 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                    <span className="font-bold text-slate-800">{DAY_NAMES[r.day_of_week]}</span>
                    <span className="text-slate-600 font-mono">
                      {r.start_time.slice(0, 5)} – {r.end_time.slice(0, 5)} ({session.organization.timezone})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements & Preparation */}
            {session.requirements && (
              <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" /> Prerequisites & Equipment
                </h2>
                {session.requirements.prerequisites && (
                  <div>
                    <h3 className="text-xs font-bold uppercase text-slate-400">Prerequisites</h3>
                    <p className="text-sm text-slate-700 mt-1">{session.requirements.prerequisites}</p>
                  </div>
                )}
                {session.requirements.required_equipment && (
                  <div>
                    <h3 className="text-xs font-bold uppercase text-slate-400">Required Equipment</h3>
                    <p className="text-sm text-slate-700 mt-1">{session.requirements.required_equipment}</p>
                  </div>
                )}
                {session.requirements.preparation_instructions && (
                  <div>
                    <h3 className="text-xs font-bold uppercase text-slate-400">Preparation Instructions</h3>
                    <p className="text-sm text-slate-700 mt-1">{session.requirements.preparation_instructions}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Checkout Card Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm lg:sticky lg:top-24 space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pricing Tier</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">
                    {session.pricing?.currency === "INR" ? "₹" : "$"}
                    {session.pricing?.price?.toLocaleString()}
                  </span>
                  <span className="text-sm text-slate-500 font-medium">
                    / {session.pricing?.pricing_type?.toLowerCase()}
                  </span>
                </div>
              </div>

              {/* Policy & Buying Information Breakdown */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#CEDECF] text-xs space-y-2.5 text-slate-700">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-slate-500">Seat Capacity:</span>
                  <span className="font-bold text-[#0C2417]">
                    {session.availability ? `${session.availability.remaining_spots} of ${session.availability.capacity} spots left` : `${session.capacity} spots`}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2 border-t border-[#E1E9E2] pt-2">
                  <div>
                    <span className="font-semibold text-slate-500 block">Cancellation:</span>
                    <span className="text-[10px] text-emerald-800 font-medium">Inherited studio policy</span>
                  </div>
                  <span className="text-slate-700 text-right">{session.cancellation_terms || "Free cancellation up to 2 hours before start."}</span>
                </div>

                <div className="flex items-start justify-between gap-2 border-t border-[#E1E9E2] pt-2">
                  <span className="font-semibold text-slate-500">Renewal Policy:</span>
                  <span className="text-slate-700 text-right">{session.renewal_terms || "One-time purchase; no automatic recurring deductions."}</span>
                </div>

                <div className="flex items-start justify-between gap-2 border-t border-[#E1E9E2] pt-2">
                  <span className="font-semibold text-slate-500">Live Video:</span>
                  <span className="text-slate-700 text-right">{session.meeting_readiness || "Zoom link opens 15m before class."}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Interactive Live Scheduled Classes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Protected Zoom Video Access Link</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Class Attendance & Credit Tracker</span>
                </div>
              </div>

              <button
                onClick={() => { window.history.replaceState(null,'','?buy=1'); setModalOpen(true); }}
                className="w-full py-3.5 rounded-2xl bg-[#133623] hover:bg-[#0C2417] text-white font-bold text-sm shadow-md transition"
              >
                Buy class
              </button>
            </div>
          </div>
        </div>
      </main>
      <footer className="flex justify-center border-t bg-white py-6"><Link href="/" aria-label="ProgressNow home"><BrandLogo size={28} showText /></Link></footer>

      <EnrollmentModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); window.history.replaceState(null,'',window.location.pathname); }}
        sessionId={session.id}
        sessionName={session.name}
        price={session.pricing?.price || 0}
        currency={session.pricing?.currency || "INR"}
        totalClasses={session.pricing?.total_classes}
        validityDays={session.pricing?.validity_days}
      />
    </div>
  );
}
