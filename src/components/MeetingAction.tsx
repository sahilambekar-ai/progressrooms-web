'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, Copy, ExternalLink, Mail } from 'lucide-react';
import { openMeetingTab } from '@/lib/meeting-window';

export type MeetingLink = string | { meeting_url: string; join_url?: string };

function validMeetingUrl(value?: string | null) {
  if (!value) return '';
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}

export function MeetingAction({ endAt, canStart = false, meetingUrl: savedUrl, load, onError, onSendInvite }: {
  endAt?: string; canStart?: boolean; meetingUrl?: string | null;
  load: () => Promise<MeetingLink>; onSendInvite?: () => Promise<string>; onError: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState('');
  const meetingUrl = validMeetingUrl(savedUrl) || resolvedUrl;
  const [inviteNotice, setInviteNotice] = useState('');
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => () => clearTimeout(copyTimer.current), []);
  useEffect(() => { setResolvedUrl(''); setCopied(false); }, [savedUrl]);
  useEffect(() => {
    const end = endAt ? Date.parse(endAt) : NaN;
    if (!Number.isFinite(end) || end <= now) return;
    const timer = setTimeout(() => setNow(Date.now()), Math.min(Math.max(0, end - Date.now()) + 10, 2_147_483_647));
    return () => clearTimeout(timer);
  }, [endAt, now]);

  const resolveLink = async (forCopy = false) => {
    const result = await load();
    const joinUrl = validMeetingUrl(typeof result === 'string' ? result : result.join_url || result.meeting_url);
    const target = validMeetingUrl(typeof result === 'string' ? result : result.meeting_url);
    if (!joinUrl || !target) throw new Error('Invalid meeting link.');
    // Copy the participant link, never a private host start URL.
    setResolvedUrl(joinUrl);
    return forCopy ? joinUrl : target;
  };

  const joinMeeting = () => {
    if (busy) return;
    setBusy(true);
    void openMeetingTab(() => resolveLink()).catch(error => onError(error instanceof Error ? error.message : 'Could not open meeting.')).finally(() => setBusy(false));
  };

  const copyLink = async () => {
    setBusy(true);
    try {
      if (meetingUrl) {
        await navigator.clipboard.writeText(meetingUrl);
      } else if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        const link = resolveLink(true).then(url => new Blob([url], { type: 'text/plain' }));
        await navigator.clipboard.write([new ClipboardItem({ 'text/plain': link })]);
      } else {
        await navigator.clipboard.writeText(await resolveLink(true));
      }
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      onError('Could not copy the meeting link. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs">
      <div role="group" aria-label="Meeting actions" className="inline-flex shrink-0 overflow-hidden rounded-md border border-[#2D7A58]">
        <button type="button" disabled={busy} onClick={joinMeeting}
          title={canStart ? 'Open meeting as host' : 'Join meeting'}
          className="inline-flex h-6 items-center gap-1 bg-[#2D7A58] px-2 font-semibold text-white hover:bg-[#133623] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] disabled:opacity-50">
          <span>{busy ? 'Loading…' : 'Join'}</span><ExternalLink size={12} aria-hidden="true" />
        </button>
        <button type="button" disabled={busy} onClick={() => void copyLink()}
          title={copied ? 'Link copied' : 'Copy meeting link'} aria-label={copied ? 'Meeting link copied' : 'Copy meeting link'}
          className="inline-flex h-6 w-7 items-center justify-center border-l border-[#2D7A58] bg-white text-[#2D7A58] hover:bg-[#F4F7F4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] disabled:opacity-50">
          {copied ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
        </button>
        {onSendInvite && <button type="button" disabled={busy} onClick={() => {
          setBusy(true); setInviteNotice('');
          void onSendInvite().then(setInviteNotice).catch(error => onError(error instanceof Error ? error.message : 'Could not queue the invitation.')).finally(() => setBusy(false));
        }} title="Email joining instructions to class recipients" className="inline-flex h-6 items-center gap-1 border-l border-[#2D7A58] bg-white px-2 font-semibold text-[#2D7A58] hover:bg-[#F4F7F4] disabled:opacity-50"><Mail size={12} aria-hidden="true" />Send invite</button>}
      </div>
      {inviteNotice && <span role="status" className="text-[#2D7A58]">{inviteNotice}</span>}
      <span className="sr-only" role="status">{copied ? 'Meeting link copied' : ''}</span>
    {endAt && Date.parse(endAt) <= now && <span className="inline-flex shrink-0 items-center gap-1 font-medium text-slate-500"><Check size={12} aria-hidden="true" />Completed</span>}
  </div>;
}
