'use client';
import { useEffect, useState } from 'react';
import { openMeetingTab } from '@/lib/meeting-window';

export function MeetingAction({ endAt, canStart = false, load, onError }: {
  endAt?: string; canStart?: boolean; load: () => Promise<string>; onError: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const end = endAt ? Date.parse(endAt) : NaN;
    if (!Number.isFinite(end) || end < now) return;
    const timer = setTimeout(() => setNow(Date.now()), Math.min(Math.max(0, end - Date.now()) + 10, 2_147_483_647));
    return () => clearTimeout(timer);
  }, [endAt, now]);
  return <span className="inline-flex items-center gap-2">
    <button type="button" disabled={busy} className="rounded-xl bg-[#2D7A58] px-4 py-2 text-xs font-bold text-white hover:bg-[#133623] disabled:opacity-50" onClick={() => {
      setBusy(true);
      void openMeetingTab(load).catch(error => onError(error instanceof Error ? error.message : 'Could not open class.')).finally(() => setBusy(false));
    }}>{busy ? 'Opening class…' : canStart ? 'Start class' : 'Join class'}</button>
    {endAt && Date.parse(endAt) < now && <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">Completed</span>}
  </span>;
}
