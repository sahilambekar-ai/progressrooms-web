'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MeetingAction } from '@/components/MeetingAction';
import { staffApi } from '@/lib/staff-api';

export default function MeetingInvitePage() {
  const params = useParams<{ occurrenceId: string }>();
  const [account, setAccount] = useState<{ role: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [returnUrl, setReturnUrl] = useState('');
  const [studio, setStudio] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    setReturnUrl(window.location.pathname + window.location.search);
    setStudio(new URLSearchParams(window.location.search).get('studio') || '');
    if (!localStorage.getItem('pr_access_token')) { setReady(true); return; }
    void staffApi('/auth/me').then(setAccount).catch(() => setAccount(null)).finally(() => setReady(true));
  }, []);
  return <main className="mx-auto my-16 max-w-lg space-y-5 rounded-2xl border border-[#CEDECF] bg-white p-7 text-sm">
    <h1 className="font-serif text-2xl font-bold text-[#0C2417]">Join your class</h1>
    <p className="text-slate-600">Sign in with the account that received this invitation. Your current class access will be checked when you join.</p>
    {!ready && <p role="status">Checking your account…</p>}
    {ready && !account && <a className="inline-block rounded-lg bg-[#2D7A58] px-4 py-2 font-semibold text-white" href={`/login?next=${encodeURIComponent(returnUrl)}`}>Sign in to join</a>}
    {account && <MeetingAction onError={setError} load={async () => {
      if (account.role === 'STUDENT') return (await staffApi(`/student/classes/${params.occurrenceId}/meeting-url`)).meeting_url;
      if (!studio) throw new Error('This invitation is missing its studio. Open the class from your dashboard.');
      return await staffApi(`/organizations/${encodeURIComponent(studio)}/occurrences/${params.occurrenceId}/join-link`, { method: 'POST' });
    }} />}
    {error && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-amber-900">{error}</p>}
    {account && <a className="block text-xs underline" href={account.role === 'STUDENT' ? '/student' : '/dashboard'}>Open my dashboard</a>}
  </main>;
}
