"use client";

import { useState } from "react";
import Link from "next/link";
import { Video, Calendar, Clock, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function StudentPortalPage() {
  const [activeTab, setActiveTab] = useState<"CLASSES" | "ENROLLMENTS">("CLASSES");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
              PR
            </Link>
            <span className="font-bold text-slate-900">Student Portal</span>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="text-slate-500">Logged in as <span className="font-bold text-slate-900">student1@test.progressrooms.local</span></span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full flex-1 space-y-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">
              Live Session Access
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-2">Next Class: Morning Hatha Flow</h1>
            <p className="text-indigo-100 text-sm mt-1">
              Tomorrow at 07:00 AM IST with Sahil Sharma. Your live video link will unlock 15 minutes before class starts.
            </p>
            <button
              onClick={() => alert("Connecting to secure class meeting...")}
              className="mt-5 px-5 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-sm hover:bg-indigo-50 shadow-md transition flex items-center gap-2"
            >
              <Video className="h-4 w-4 text-indigo-600" /> Join Class Room
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-3 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("CLASSES")}
            className={`pb-3 text-sm font-bold border-b-2 transition ${
              activeTab === "CLASSES" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Upcoming Classes (Rolling 30 Days)
          </button>
          <button
            onClick={() => setActiveTab("ENROLLMENTS")}
            className={`pb-3 text-sm font-bold border-b-2 transition ${
              activeTab === "ENROLLMENTS" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            My Active Enrollments
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "CLASSES" && (
          <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 shadow-sm">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center font-bold">
                  <span className="text-xs uppercase">Wed</span>
                  <span className="text-sm">07:00</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Morning Hatha Flow</h3>
                  <p className="text-xs text-slate-500">Sahil Yoga Studio • Instructor: Sahil Sharma</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                Confirmed
              </span>
            </div>

            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center font-bold">
                  <span className="text-xs uppercase">Fri</span>
                  <span className="text-sm">07:00</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Morning Hatha Flow</h3>
                  <p className="text-xs text-slate-500">Sahil Yoga Studio • Instructor: Sahil Sharma</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                Confirmed
              </span>
            </div>
          </div>
        )}

        {activeTab === "ENROLLMENTS" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-emerald-50 text-emerald-700">
                  Active
                </span>
                <span className="text-xs text-slate-400">Order #PR-TEST-ORD-001</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Morning Hatha Flow</h3>
                <p className="text-xs text-slate-500">Sahil Yoga Studio • Monthly Access Window</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <p className="text-slate-400 font-bold uppercase">Attendance</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">2 classes completed</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase">Renewal</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">In 28 days</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
