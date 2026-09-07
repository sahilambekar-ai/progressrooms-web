"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, Users, Shield, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { PublicSessionDetailPayload } from "@/types";
import { EnrollmentModal } from "@/components/EnrollmentModal";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function SessionDetailClient({ session }: { session: PublicSessionDetailPayload }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Breadcrumb Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href={`/${session.organization.slug}`}
            className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to {session.organization.name}
          </Link>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
            {session.class_type || "Scheduled Class"}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                  {session.session_type}
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                  {session.skill_level}
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                  {session.duration_minutes} Mins
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {session.name}
              </h1>

              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                {session.full_description || session.short_description}
              </p>
            </div>

            {/* Weekly Schedule */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-indigo-600" /> Weekly Class Schedule
              </h2>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                {session.schedule.map((r, i) => (
                  <div key={i} className="p-4 bg-slate-50/50 flex items-center justify-between text-sm">
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
              <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
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
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm sticky top-24">
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

              <div className="mt-6 space-y-3 text-xs text-slate-600 border-t border-b border-slate-100 py-4">
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
                onClick={() => setModalOpen(true)}
                className="mt-6 w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition"
              >
                Enroll Now
              </button>
            </div>
          </div>
        </div>
      </main>

      <EnrollmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        sessionId={session.id}
        sessionName={session.name}
        price={session.pricing?.price || 0}
        currency={session.pricing?.currency || "INR"}
      />
    </div>
  );
}
