"use client";

import { useState } from "react";
import Link from "next/link";
import { Video, Calendar, Clock, ArrowRight, ShieldCheck, CheckCircle2, ArrowLeft } from "lucide-react";

export default function StudentPortalPage() {
  const [activeTab, setActiveTab] = useState<"CLASSES" | "ENROLLMENTS">("CLASSES");

  return (
    <div className="min-h-screen bg-[#F4F7F4] text-[#1A2E22] flex flex-col font-sans">
      {/* Nature Student Header */}
      <header className="bg-white border-b border-[#E1E9E2] sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="h-9 w-9 rounded-2xl bg-gradient-to-br from-[#0C2417] to-[#1b4332] flex items-center justify-center text-white text-lg shadow-sm">
              🌿
            </Link>
            <div>
              <span className="font-serif font-bold text-[#0C2417] text-base">Student Sanctuary Portal</span>
              <span className="block text-[10px] uppercase font-bold text-[#81A882]">ProgressRooms</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <span className="text-slate-500">
              Yogi: <strong className="text-[#0C2417]">Aarav Patel</strong> (student1@test.progressrooms.local)
            </span>
            <Link href="/login" className="text-xs text-red-600 font-semibold hover:underline">
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full flex-1 space-y-8">
        {/* Welcome Sanctuary Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #0C2417 0%, #1b4332 100%)",
          }}
          className="text-white p-8 rounded-3xl shadow-xl relative overflow-hidden border border-[#2D7A58]"
        >
          <div className="relative z-10 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-white/15 text-xs font-semibold text-[#b7e4c7] inline-flex items-center gap-1.5">
              <span>🌿</span>
              <span>Live Scheduled Batch Access</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold mt-3">Next Class: Morning Hatha Flow</h1>
            <p className="text-[#e8f5e9] text-xs sm:text-sm mt-2 leading-relaxed">
              Tomorrow at 07:00 AM IST with Sahil Sharma. Your live video meeting room will unlock automatically 15 minutes before class starts.
            </p>
            <button
              onClick={() => alert("Connecting to live video sanctuary...")}
              className="mt-5 px-5 py-2.5 rounded-xl bg-white text-[#0C2417] font-bold text-xs hover:bg-[#F4F7F4] shadow-md transition flex items-center gap-2"
            >
              <Video className="h-4 w-4 text-[#1b4332]" /> Join Live Class Room
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 border-b border-[#CEDECF]">
          <button
            onClick={() => setActiveTab("CLASSES")}
            className={`pb-3 text-xs uppercase font-bold tracking-wider border-b-2 transition ${
              activeTab === "CLASSES" ? "border-[#133623] text-[#0C2417]" : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            Upcoming Scheduled Classes
          </button>
          <button
            onClick={() => setActiveTab("ENROLLMENTS")}
            className={`pb-3 text-xs uppercase font-bold tracking-wider border-b-2 transition ${
              activeTab === "ENROLLMENTS" ? "border-[#133623] text-[#0C2417]" : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            My Active Memberships & Passes
          </button>
        </div>

        {/* Classes List */}
        {activeTab === "CLASSES" && (
          <div className="bg-white rounded-3xl border border-[#E1E9E2] divide-y divide-[#E1E9E2] shadow-sm">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-[#E8F0E9] text-[#1b4332] flex flex-col items-center justify-center font-bold">
                  <span className="text-[10px] uppercase">Wed</span>
                  <span className="text-sm">07:00</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#0C2417] text-sm">Morning Hatha Flow</h3>
                  <p className="text-xs text-slate-500">Sahil Yoga Studio • Instructor: Sahil Sharma (Lead Guru)</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                Confirmed (Zoom Integrated)
              </span>
            </div>

            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-[#E8F0E9] text-[#1b4332] flex flex-col items-center justify-center font-bold">
                  <span className="text-[10px] uppercase">Fri</span>
                  <span className="text-sm">07:00</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#0C2417] text-sm">Morning Hatha Flow</h3>
                  <p className="text-xs text-slate-500">Sahil Yoga Studio • Instructor: Sahil Sharma (Lead Guru)</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                Confirmed (Zoom Integrated)
              </span>
            </div>
          </div>
        )}

        {/* Memberships List */}
        {activeTab === "ENROLLMENTS" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-[#E1E9E2] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-emerald-50 text-emerald-700">
                  Active
                </span>
                <span className="text-xs font-mono text-slate-400">#PR-TEST-ORD-001</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0C2417]">Morning Hatha Flow</h3>
                <p className="text-xs text-slate-500">Sahil Yoga Studio • Monthly Rolling Pass</p>
              </div>
              <div className="bg-[#F4F7F4] p-4 rounded-2xl border border-[#CEDECF] flex items-center justify-between text-xs">
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Sessions Attended</p>
                  <p className="text-sm font-bold text-[#0C2417] mt-0.5">8 of 12 completed</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Renewal Date</p>
                  <p className="text-sm font-bold text-[#0C2417] mt-0.5">In 22 days</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
