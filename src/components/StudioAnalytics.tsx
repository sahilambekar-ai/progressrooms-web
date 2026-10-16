"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { staffApi } from "@/lib/staff-api";

export function StudioAnalytics({ organizationId, onOpenBilling }: { organizationId: string; onOpenBilling: () => void }) {
  const [analyticsError, setAnalyticsError] = useState("");
  // Reconciled Studio Analytics State
  const [studioAnalytics, setStudioAnalytics] = useState<{
    active_enrolled_students: number;
    active_recurring_batches: number;
    total_support_queries: number;
    projected_subscription_value: number;
    collected_revenue: number;
    billed_revenue: number;
    currency: string;
    explanation: string;
  } | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const fetchStudioAnalytics = useCallback(async () => {
    const orgId = organizationId;
    if (!orgId) return;
    setAnalyticsLoading(true);
    setAnalyticsError("");
    try {
      const res = await staffApi(`/organizations/${orgId}/analytics`);
      setStudioAnalytics(res);
    } catch (e) {
      setAnalyticsError("Could not load studio analytics. Please try again.");
    } finally {
      setAnalyticsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => { void fetchStudioAnalytics(); }, [fetchStudioAnalytics]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Studio Analytics & Reconciled Aggregates</h1>
          <p className="text-xs text-[#40514E] mt-0.5">Aggregated metrics derived from active database records and verified enrollments.</p>
        </div>
        <button
          type="button"
          onClick={() => void fetchStudioAnalytics()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#CEDECF] text-xs font-bold text-[#133623] hover:bg-[#FAF7F2] transition shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${analyticsLoading ? "animate-spin" : ""}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {analyticsError && <p role="alert" className="text-sm text-red-700">{analyticsError}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-medium">Active Enrolled Students</span>
          <h3 className="text-3xl font-black text-[#0C2417]">
            {studioAnalytics ? studioAnalytics.active_enrolled_students : "—"}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">Distinct students with confirmed active class enrollments</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-medium">Active Recurring Batches</span>
          <h3 className="text-3xl font-black text-[#0C2417]">
            {studioAnalytics ? studioAnalytics.active_recurring_batches : "—"}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">Weekly configured active class schedules</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-medium">Total Support Queries</span>
          <h3 className="text-3xl font-black text-[#0C2417]">
            {studioAnalytics ? studioAnalytics.total_support_queries : "—"}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">Student conversations in ticket queue</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-medium">Projected Subscription Value</span>
          <h3 className="text-3xl font-black text-[#0C2417]">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: studioAnalytics?.currency || 'INR', maximumFractionDigits: 0 }).format(
              studioAnalytics?.projected_subscription_value ?? 0
            )}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">Sum of active batch subscription fees & passes</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-medium">Collected Gateway Revenue</span>
          <h3 className="text-3xl font-black text-emerald-800">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: studioAnalytics?.currency || 'INR', maximumFractionDigits: 0 }).format(
              studioAnalytics?.collected_revenue ?? 0
            )}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">Total captured payment transactions from payment gateways</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-medium">Scheduled Billed Revenue</span>
          <h3 className="text-3xl font-black text-[#0C2417]">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: studioAnalytics?.currency || 'INR', maximumFractionDigits: 0 }).format(
              studioAnalytics?.billed_revenue ?? 0
            )}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">Total subscription billing commitment from enrollments</p>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#CEDECF] text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-base">📊</span>
          <span className="font-bold text-[#0C2417] text-sm">Revenue Accounting & Gateway Reconciliation</span>
        </div>
        <p className="leading-relaxed">
          <strong>Billed Revenue vs Collected Revenue:</strong> Billed revenue represents the total contracted subscription value calculated from enrolled student memberships. Collected revenue represents actual net funds captured via Razorpay/payment gateways. Scheduled billing reports currently exclude real-time gateway settlements until reconciled.
        </p>
        <div className="pt-2 border-t border-[#E1E9E2] flex items-center justify-between">
          <span>Need itemized ledger rows or CSV accounting reports?</span>
          <button
            type="button"
            onClick={() => onOpenBilling()}
            className="font-bold text-[#133623] underline hover:text-[#0C2417]"
          >
            Open Billing Center & Export CSV →
          </button>
        </div>
      </div>
    </div>
  );
}
