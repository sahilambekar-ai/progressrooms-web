"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
export function StudioAccount() {
  const [user, setUser] = useState<{full_name: string; role: string} | null>(null);
  const [returnTo, setReturnTo] = useState('/');
  useEffect(() => {
    setReturnTo(window.location.pathname);
    try {
      const token = localStorage.getItem('pr_access_token');
      if (token) {
        const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
        void fetch(`${api}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }).then(async res => {
          if (res.ok) setUser(await res.json());
        }).catch(() => setUser(null));
      }
    } catch { setUser(null); }
  }, []);
  return user ? <Link href={user.role === 'STUDENT' ? '/student' : '/dashboard'} title={`${user.full_name} · My dashboard`} aria-label={`${user.full_name} · My dashboard`} className="w-11 h-11 rounded-full bg-[#133623] text-white grid place-items-center font-bold">{user.full_name?.charAt(0) || 'Me'}</Link> : <Link className="rounded-full border px-5 py-3 font-semibold" href={`/login?next=${encodeURIComponent(returnTo)}`}>Log in</Link>;
}
