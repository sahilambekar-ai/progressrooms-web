"use client";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ReactNode } from 'react';
export function AuthFlowLink({ destination, children }: { destination: 'login' | 'register'; children: ReactNode }) {
  const search = useSearchParams();
  const requested = search.get('next');
  const next = requested && requested.startsWith('/') && !requested.startsWith('//') && !/[\\\s]/.test(requested) ? requested : null;
  const href = next ? `/${destination}?${destination === 'register' ? 'role=STUDENT&' : ''}next=${encodeURIComponent(next)}` : `/${destination}`;
  return <Link className="text-xs font-semibold text-[#2D7A58] hover:underline" href={href}>{children}</Link>;
}
