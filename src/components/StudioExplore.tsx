"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PublicWebsitePayload } from '@/types';
import { StudioAccount } from './StudioAccount';
import { StoreCheckout, Purchase } from './StoreCheckout';
const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const money = (price: number, currency: string) => new Intl.NumberFormat('en-IN',{style:'currency',currency}).format(price);
export function StudioExplore({ data, embedded = false }: { data: PublicWebsitePayload; embedded?: boolean }) {
  const { organization: org, sessions, passes = [] } = data;
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [dayFilter, setDayFilter] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [modeFilter, setModeFilter] = useState('ALL');
  const [selected, setSelected] = useState<Purchase | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('buy'), kind = params.get('kind');
    const session = sessions.find(s => s.id === id);
    const pass = passes.find(p => p.id === id);
    if (kind === 'class' && session?.pricing) setSelected({ id: session.id, kind: 'class', name: session.name, ...session.pricing });
    if (kind === 'pass' && pass) setSelected({ ...pass, kind: 'pass' });
  }, [sessions, passes]);

  function select(offering: Purchase) {
    window.history.replaceState(null, '', `?${embedded ? `studio=${encodeURIComponent(org.slug)}&` : ""}kind=${offering.kind}&buy=${offering.id}`);
    setSelected(offering);
  }

  function formatSkillLevel(lvl: string) {
    if (lvl === 'ALL_LEVELS') return 'All skill levels';
    return lvl.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  const filteredSessions = sessions.filter(s => {
    if (query.trim()) {
      const q = query.toLowerCase();
      if (!s.name.toLowerCase().includes(q) && !(s.short_description || '').toLowerCase().includes(q)) return false;
    }
    if (dayFilter !== 'ALL') {
      const d = Number(dayFilter);
      if (!s.schedule.some(r => r.day_of_week === d)) return false;
    }
    if (levelFilter !== 'ALL' && s.skill_level !== levelFilter) return false;
    if (modeFilter !== 'ALL') {
      if (modeFilter === 'ONE_TO_ONE' && s.session_type !== 'ONE_TO_ONE') return false;
      if (modeFilter === 'REGULAR' && s.session_type === 'ONE_TO_ONE') return false;
    }
    return true;
  });

  const filteredPasses = passes.filter(p => {
    if (query.trim()) {
      const q = query.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !(p.description || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return <div className="min-h-screen bg-[#F4F7F4] text-[#133623]">
    {!embedded && <header className="bg-white border-b sticky top-0 z-20"><div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between gap-4"><Link href={`/${org.slug}`} className="font-serif font-bold text-xl">{org.name}</Link><nav className="flex items-center gap-4 text-sm"><Link href={`/${org.slug}`}>Home</Link><StudioAccount /></nav></div></header>}
    <div id={embedded ? undefined : "main-content"} role={embedded ? undefined : "main"} className={embedded ? "" : "max-w-6xl mx-auto p-5 sm:p-10"}>
      {!embedded && <div className="py-8 sm:py-14"><p className="uppercase tracking-widest text-sm mb-4">A little room for your next step</p><h1 className="font-serif text-4xl sm:text-6xl">Explore classes & passes</h1><p className="mt-5 text-lg text-slate-600 max-w-2xl">Find a class you love, or choose a pass to explore more. Browse freely and log in when you’re ready to buy.</p></div>}

      <div className="space-y-4 mb-8">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex gap-2" role="group" aria-label="Offerings">
            {['all', 'classes', 'passes'].map(t => (
              <button
                key={t}
                aria-pressed={tab === t}
                onClick={() => setTab(t)}
                className={`rounded-full px-5 py-2.5 capitalize border text-xs sm:text-sm font-semibold transition ${
                  tab === t ? 'bg-[#133623] text-white border-[#133623]' : 'bg-white text-slate-700 border-[#CEDECF] hover:bg-[#FAF7F2]'
                }`}
              >
                {t === 'all' ? 'All offerings' : t}
              </button>
            ))}
          </div>
          <input
            aria-label="Search classes and passes"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search classes or passes…"
            className="rounded-full border border-[#CEDECF] bg-white px-5 py-2.5 text-xs sm:text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-[#133623]"
          />
        </div>

        {tab !== 'passes' && (
          <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-2xl bg-white border border-[#CEDECF] text-xs">
            <span className="text-slate-500 font-medium">Filter Classes:</span>
            <select
              value={dayFilter}
              onChange={e => setDayFilter(e.target.value)}
              className="border border-[#CEDECF] px-2.5 py-1.5 rounded-xl bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#133623]"
            >
              <option value="ALL">All Days</option>
              {days.map((d, i) => (
                <option key={d} value={String(i)}>{d}</option>
              ))}
            </select>

            <select
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value)}
              className="border border-[#CEDECF] px-2.5 py-1.5 rounded-xl bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#133623]"
            >
              <option value="ALL">All Levels</option>
              <option value="ALL_LEVELS">All Skill Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>

            <select
              value={modeFilter}
              onChange={e => setModeFilter(e.target.value)}
              className="border border-[#CEDECF] px-2.5 py-1.5 rounded-xl bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#133623]"
            >
              <option value="ALL">All Formats</option>
              <option value="REGULAR">Group Batches</option>
              <option value="ONE_TO_ONE">1-on-1 Sessions</option>
            </select>

            {(dayFilter !== 'ALL' || levelFilter !== 'ALL' || modeFilter !== 'ALL' || query) && (
              <button
                type="button"
                onClick={() => {
                  setDayFilter('ALL');
                  setLevelFilter('ALL');
                  setModeFilter('ALL');
                  setQuery('');
                }}
                className="text-xs text-[#2D7A58] hover:text-[#133623] font-semibold underline underline-offset-2 ml-auto"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {tab !== 'passes' && <section aria-label="Classes"><h2 className="font-serif text-2xl mb-5">Classes</h2><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{filteredSessions.map(s => <article key={s.id} className="bg-white border border-[#CEDECF] rounded-3xl p-6 flex flex-col gap-4 shadow-xs"><p className="text-xs font-semibold text-slate-500">{s.duration_minutes} minutes · {formatSkillLevel(s.skill_level)} · {s.delivery_mode === "ONLINE_LIVE" ? "Online Live (Zoom)" : "In-Studio / Hybrid"}</p><h3 className="font-serif text-2xl text-[#0C2417]">{s.name}</h3><p className="text-slate-600 text-xs flex-1">{s.short_description || 'Make time to learn and grow with us.'}</p><div className="text-xs space-y-1 text-slate-700 bg-[#FAF7F2] p-3 rounded-2xl border border-[#CEDECF]">{s.schedule.map((r, i) => <p key={i} className="font-medium">• {days[r.day_of_week]} · {r.start_time.slice(0, 5)}–{r.end_time.slice(0, 5)}</p>)}{s.schedule.length > 0 && <p className="text-[11px] text-slate-500 pt-1 border-t border-[#E1E9E2]">{s.remaining_spots !== undefined ? `${s.remaining_spots} of ${s.capacity} spots left` : `${s.capacity} spots`} · Timezone: {org.timezone}</p>}</div>{s.pricing ? <><p className="font-bold text-xl text-[#0C2417]">{money(s.pricing.price, s.pricing.currency)}</p><p className="text-xs text-slate-500">{s.pricing.total_classes ? `${s.pricing.total_classes} sessions` : 'No session limit'} · {s.pricing.validity_days || 30} days validity · {s.remaining_spots !== undefined ? `${s.remaining_spots} of ${s.capacity} spots left` : `${s.capacity || 20} spots`}</p><button className="rounded-xl bg-[#133623] hover:bg-[#0C2417] text-white p-3 font-semibold text-sm transition" onClick={() => select({ id: s.id, kind: 'class', name: s.name, ...s.pricing! })}>Buy class</button></> : <p className="text-xs text-slate-500">Contact the studio for pricing</p>}<Link className="text-xs font-semibold underline text-center text-[#2D7A58] hover:text-[#133623]" href={`/${org.slug}/classes/${s.slug}`}>View class details</Link></article>)}</div>{!filteredSessions.length && <p className="p-6 bg-white rounded-2xl border border-[#CEDECF] text-slate-500 text-sm">No classes found matching your filters. Please check back soon.</p>}</section>}
      {tab !== 'classes' && <section aria-label="Passes" className="mt-10"><h2 className="font-serif text-2xl mb-5">Memberships & passes</h2><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{filteredPasses.map(p => <article key={p.id} className="bg-[#E8F0E9] border border-[#CEDECF] rounded-3xl p-6 flex flex-col gap-4 shadow-xs"><h3 className="font-serif text-2xl text-[#0C2417]">{p.name}</h3><p className="text-slate-600 text-xs">{p.description}</p><div>{p.offer_price != null && p.offer_price < p.price && <p className="text-xs text-slate-500"><span className="line-through">{money(p.price, p.currency)}</span> <span className="ml-2 font-bold text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded-full">Offer price</span></p>}<p className="font-bold text-xl text-[#0C2417]">{money(p.offer_price ?? p.price, p.currency)}</p></div><p className="text-xs text-slate-600 font-medium">{p.total_classes ? `${p.total_classes} sessions shared across included classes` : 'No session limit'} · {p.validity_days} days validity</p><div className="flex-1"><p className="font-semibold text-xs text-slate-700">Included classes</p><ul className="mt-2 space-y-1 text-xs text-slate-600">{p.classes.map(c => <li key={c.id}>• {c.name}</li>)}</ul></div><button disabled={!p.classes.length} className="rounded-xl bg-[#133623] hover:bg-[#0C2417] text-white p-3 font-semibold text-sm disabled:opacity-50 transition" onClick={() => select({ ...p, kind: 'pass' })}>{p.classes.length ? 'Buy pass' : 'Classes coming soon'}</button></article>)}</div>{!filteredPasses.length && <p className="p-6 bg-white rounded-2xl border border-[#CEDECF] text-slate-500 text-sm">No passes found matching your filters.</p>}</section>}
      <p className="text-sm text-slate-500 mt-12">{org.name} · Powered by ProgressRooms</p>
    </div>
    {selected && <StoreCheckout offering={selected} onClose={()=>{setSelected(null);window.history.replaceState(null,'',window.location.pathname + (embedded ? `?studio=${encodeURIComponent(org.slug)}` : ''));}} />}
  </div>;
}
