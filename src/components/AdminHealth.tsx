"use client";

import { useEffect, useState } from "react";
import { Activity, ArrowUpRight, Clock3, Database, RefreshCw, Server, ShieldCheck } from "lucide-react";
import { staffApi } from "@/lib/staff-api";

type Point = { time: number; stress: number | null; cpu: number | null; memory: number | null; requests: number; errors: number };
type Health = {
  period: string; environment: string; timezone: string; peak_stress: number | null;
  maximum_idle_seconds: number; samples: number; first_sample: number | null; points: Point[];
  period_start: number; period_end: number; bucket_seconds: number;
  latest: { time: number; cpu: number | null; memory: number | null; disk: number; load: number } | null;
  requests: number; errors: number; average_response_ms: number | null;
};
type Period = "day" | "week" | "month";
const percent = (value: number | null | undefined) => value == null ? "—" : `${value.toFixed(1)}%`;
const number = (value: number | undefined) => value == null ? "—" : Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(value);
const timeLabel = (time: number, period: Period, timezone: string) => new Date(time * 1000).toLocaleString("en-IN", { timeZone: timezone, ...(period === "day" ? { hour: "2-digit", minute: "2-digit" } : { day: "numeric", month: "short" }) });
const colors = { stress: "#244D39", cpu: "#34A6A0", memory: "#9FAF70" };

function StressChart({ data, period }: { data: Health; period: Period }) {
  const span = Math.max(1, data.period_end - data.period_start);
  const x = (time: number) => 42 + Math.max(0, time - data.period_start) / span * 708;
  const y = (value: number) => 196 - value * 1.64;
  return <svg viewBox="0 0 780 238" className="h-full w-full" role="img" aria-label="CPU, RAM and peak stress over the selected period">
    {[0, 25, 50, 75, 100].map(value => <g key={value}><line x1="42" x2="750" y1={y(value)} y2={y(value)} stroke="#EBEFEC" strokeDasharray={value === 0 ? undefined : "3 5"} /><text x="7" y={y(value) + 4} fill="#85938A" fontSize="10">{value}%</text></g>)}
    <line x1="42" x2="750" y1={y(90)} y2={y(90)} stroke="#D4AA80" strokeDasharray="4 5" opacity=".7" />
    {(["memory", "cpu", "stress"] as const).map(metric => data.points.map((point, index, all) => {
      const value = point[metric]; const prev = all[index - 1];
      if (value == null) return null;
      return <g key={`${metric}-${point.time}`}><title>{new Date(point.time * 1000).toLocaleString("en-IN", { timeZone: data.timezone })} · {metric === "memory" ? "RAM" : metric.toUpperCase()} {percent(value)}</title>
        {prev?.[metric] != null && point.time - prev.time <= data.bucket_seconds * 1.5 && <line x1={x(prev.time)} y1={y(prev[metric]!)} x2={x(point.time)} y2={y(value)} stroke={colors[metric]} strokeWidth={metric === "stress" ? 2.4 : 1.6} />}
        <circle cx={x(point.time)} cy={y(value)} r={data.points.length < 8 ? 3 : 1.8} fill={colors[metric]} />
      </g>;
    }))}
    {[0, .25, .5, .75, 1].map(ratio => <text key={ratio} x={42 + ratio * 708} y="224" textAnchor={ratio === 0 ? "start" : ratio === 1 ? "end" : "middle"} fill="#85938A" fontSize="10">{timeLabel(data.period_start + ratio * span, period, data.timezone)}</text>)}
  </svg>;
}

function TrafficChart({ data }: { data: Health }) {
  const maximum = Math.max(1, ...data.points.map(point => point.requests));
  const span = Math.max(data.bucket_seconds, data.period_end - data.period_start);
  const barWidth = Math.min(22, Math.max(1, 314 * data.bucket_seconds / span - 1));
  return <svg viewBox="0 0 340 108" className="h-28 w-full" role="img" aria-label="API request volume and server errors over the selected period">
    {[0, .5, 1].map(ratio => <g key={ratio}><line x1="22" x2="336" y1={88 - ratio * 70} y2={88 - ratio * 70} stroke="#EBEFEC" /><text x="0" y={91 - ratio * 70} fontSize="8" fill="#85938A">{number(Math.round(maximum * ratio))}</text></g>)}
    {data.points.map(point => <g key={point.time}><title>{new Date(point.time * 1000).toLocaleString("en-IN", { timeZone: data.timezone })} · {point.requests} requests · {point.errors} server errors</title><rect x={22 + Math.max(0, point.time - data.period_start) / span * 314} y={88 - point.requests / maximum * 70} width={barWidth} height={point.requests / maximum * 70} rx="1" fill="#80B6A5" /><rect x={22 + Math.max(0, point.time - data.period_start) / span * 314} y={88 - point.errors / maximum * 70} width={barWidth} height={point.errors / maximum * 70} fill="#CC715F" /></g>)}
  </svg>;
}

export function AdminHealth() {
  const [period, setPeriod] = useState<Period>("day");
  const [data, setData] = useState<Health | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setData(null); setError(""); setLoading(true);
    const refresh = () => staffApi(`/admin/health?period=${period}`, { signal: controller.signal }).then(value => {
      if (active) { setData(value); setError(""); }
    }).catch(reason => { if (active && reason.name !== "AbortError") setError(reason.message); }).finally(() => { if (active) setLoading(false); });
    refresh();
    const timer = setInterval(refresh, 60000);
    return () => { active = false; controller.abort(); clearInterval(timer); };
  }, [period, revision]);
  const stale = !!data?.latest && Date.now() / 1000 - data.latest.time > 180;
  const pressure = data?.latest ? Math.max(data.latest.cpu ?? 0, data.latest.memory ?? 0, data.latest.disk) : 0;
  const status = error ? "Connection issue" : loading ? "Connecting" : !data?.latest || stale ? "Awaiting telemetry" : data.latest.cpu == null || data.latest.memory == null ? "Partial telemetry" : pressure >= 90 ? "High pressure" : pressure >= 75 ? "Needs attention" : "Resources normal";
  const caution = !!error || stale || !data?.latest || data.latest.cpu == null || data.latest.memory == null || pressure >= 75;
  const errorRate = data?.requests ? data.errors / data.requests * 100 : null;
  const kpis = [
    { label: "CPU usage", value: percent(data?.latest?.cpu), note: "Current host", accent: "#34A6A0" },
    { label: "Memory", value: percent(data?.latest?.memory), note: "Current host", accent: "#9FAF70" },
    { label: "Disk used", value: percent(data?.latest?.disk), note: "Mounted filesystem", accent: "#A99478" },
    { label: "Peak stress", value: percent(data?.peak_stress), note: "Selected period", accent: "#244D39" },
    { label: "Longest idle", value: data?.points.some(point => point.cpu != null) ? `${Math.round(data.maximum_idle_seconds / 60)}m` : "—", note: "CPU ≤ 10%", accent: "#849EAD" },
    { label: "API requests", value: number(data?.requests), note: "Selected environment", accent: "#4B8D74" },
    { label: "Server errors", value: number(data?.errors), note: errorRate == null ? "No traffic observed" : `${errorRate.toFixed(2)}% of requests`, accent: "#CC715F" },
    { label: "Avg response", value: data?.average_response_ms == null ? "—" : `${Math.round(data.average_response_ms)}ms`, note: "API processing time", accent: "#8B85A5" },
  ];
  return <div className="space-y-4 text-[#20382B]">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#819287]"><Server size={12} />Platform intelligence<span className="rounded border border-[#DDE6DF] bg-white px-1.5 py-0.5 tracking-wide text-[#4C6D59]">{data?.environment || "Environment pending"}</span></div><h1 className="text-xl font-bold tracking-tight">Platform Overview</h1></div>
      <div className="flex items-center gap-2"><div className="flex rounded-lg border border-[#DFE6E1] bg-white p-1">{(["day", "week", "month"] as const).map(value => <button key={value} aria-pressed={period === value} onClick={() => setPeriod(value)} className={`rounded-md px-3 py-1.5 text-[11px] font-semibold transition-colors ${period === value ? "bg-[#244D39] text-white shadow-sm" : "text-[#79877D] hover:bg-[#F3F6F3]"}`}>{value === "day" ? "Today" : value === "week" ? "This week" : "This month"}</button>)}</div><button aria-label="Refresh dashboard" title="Refresh dashboard" disabled={loading} onClick={() => setRevision(value => value + 1)} className="rounded-lg border border-[#DFE6E1] bg-white p-2.5 disabled:opacity-50"><RefreshCw size={14} className={loading ? "animate-spin" : ""} /></button></div>
    </header>
    {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-xs text-red-800"><span>{error}</span><button onClick={() => setRevision(value => value + 1)} className="font-semibold underline">Retry</button></div>}
    <section aria-label="Platform key performance indicators" className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">{kpis.map(kpi => <article key={kpi.label} className="relative min-w-0 overflow-hidden rounded-xl border border-[#E1E7E2] bg-white px-3 py-3.5 shadow-[0_2px_4px_#173F2A03]"><span className="absolute inset-x-0 top-0 h-0.5" style={{ background: kpi.accent }} /><p className="truncate text-[10px] font-medium text-[#7C8B81]">{kpi.label}</p><p className="mt-2 whitespace-nowrap text-[22px] font-bold leading-none tracking-tight tabular-nums">{kpi.value}</p><p className="mt-2 truncate text-[9px] text-[#92A096]" title={kpi.note}>{kpi.note}</p></article>)}</section>
    <div className="grid gap-3 lg:grid-cols-12">
      <section className="min-w-0 rounded-xl border border-[#E1E7E2] bg-white p-4 lg:col-span-8"><div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="flex items-center gap-2 text-xs font-bold"><Activity size={14} className="text-[#597B66]" />Resource pressure</h2><p className="mt-1 text-[10px] text-[#95A098]">Peak per {period === "day" ? "5 minutes" : period === "week" ? "30 minutes" : "2 hours"} · Asia/Kolkata</p></div><div className="flex gap-3 pt-1 text-[9px] text-[#819087]">{(["stress", "cpu", "memory"] as const).map(metric => <span key={metric} className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ background: colors[metric] }} />{metric === "memory" ? "RAM" : metric === "stress" ? "Stress" : "CPU"}</span>)}</div></div>
        <div className="relative mt-3 h-[258px]">{data ? <StressChart data={data} period={period} /> : <div className="absolute inset-0 grid place-items-center text-xs text-[#9AA69F]">{error ? "Unable to load resource history" : "Loading resource history…"}</div>}{data && !data.points.some(point => point.cpu != null || point.memory != null) && <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><p className="rounded-lg border border-[#E5EBE6] bg-white/95 px-4 py-3 text-center text-xs text-[#839087]">{data.samples ? "CPU / RAM telemetry requires a Linux host." : "History will appear as samples are collected."}</p></div>}</div>
        <div className="flex flex-wrap justify-between gap-2 border-t border-[#EFF2EF] pt-2.5 text-[9px] text-[#8B998F]"><span>{number(data?.samples)} sampled minutes · gaps represent unknown periods</span><span className="flex items-center gap-1"><ArrowUpRight size={11} />90% high-pressure reference</span></div>
      </section>
      <section className="min-w-0 rounded-xl border border-[#E1E7E2] bg-white p-4 lg:col-span-4"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-xs font-bold"><ShieldCheck size={14} className="text-[#597B66]" />API reliability</h2><span className="text-[9px] text-[#8A998F]">{data?.environment || "—"}</span></div><div className="mt-4 flex items-end justify-between"><div><p className="text-[10px] text-[#8B998F]">Non-5xx responses <span title="Responses below 500, including client errors">ⓘ</span></p><p className="mt-1 text-2xl font-bold tracking-tight">{errorRate == null ? "—" : `${(100 - errorRate).toFixed(2)}%`}</p></div><div className="text-right text-[10px] text-[#8B998F]"><p><span className="mr-1 inline-block h-1.5 w-1.5 rounded-sm bg-[#80B6A5]" />Requests</p><p className="mt-1"><span className="mr-1 inline-block h-1.5 w-1.5 rounded-sm bg-[#CC715F]" />5xx errors</p></div></div>
        {data ? <TrafficChart data={data} /> : <div className="grid h-28 place-items-center text-xs text-[#9AA69F]">{error ? "Unable to load API traffic" : "Loading API traffic…"}</div>}
        <div className="mt-1 border-t border-[#EFF2EF] pt-3"><div className="flex justify-between text-[10px]"><span className="flex items-center gap-1.5 text-[#8B998F]"><Database size={11} />Disk utilization</span><span className="font-semibold tabular-nums">{percent(data?.latest?.disk)}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F0F3EF]"><div className="h-full rounded-full bg-[#A99478]" style={{ width: `${data?.latest?.disk ?? 0}%` }} /></div><div className="mt-4 flex items-center justify-between text-[10px]"><span className="text-[#8B998F]">Host load · 1 minute</span><span className="font-semibold tabular-nums">{data?.latest?.load.toFixed(2) ?? "—"}</span></div></div>
      </section>
    </div>
    <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[10px] text-[#86958B]"><span className="flex items-center gap-1.5"><span className={`h-1.5 w-1.5 rounded-full ${caution ? "bg-amber-500" : "bg-emerald-500"}`} />{status}<span className="mx-1 text-[#CDD6CF]">|</span><Clock3 size={11} />{data?.latest ? `Updated ${new Date(data.latest.time * 1000).toLocaleTimeString("en-IN", { timeZone: data.timezone, hour: "2-digit", minute: "2-digit" })} IST` : "No sample yet"}</span><span>Auto-refresh 60s · History 32 days</span></footer>
    <details className="rounded-lg border border-[#E1E7E2] bg-white/60 text-[10px] text-[#7B8E80]"><summary className="cursor-pointer px-3 py-2 font-medium">Metric definitions & monitoring scope</summary><div className="grid gap-3 border-t border-[#E8EDE9] p-3 leading-relaxed sm:grid-cols-2"><p>Stress is the higher of CPU busy % and RAM used %. Idle means consecutive sampled minutes with CPU ≤10%; missing samples interrupt the run. CPU uses interval averages; RAM uses point samples. Short spikes may be missed.</p><p>Host resources include production, QAT and other visible VPS processes. API traffic covers this environment. Disk measures the mounted filesystem. Resource thresholds do not establish database or application health.</p><p>History starts at deployment. Unavailable metrics stay empty. A separate external uptime check is needed to detect an outage while this API is down.</p><p>Review sustained usage above 75%; investigate usage above 90%. RAM and CPU readings need Linux /proc; local macOS may show partial telemetry.</p></div></details>
  </div>;
}
