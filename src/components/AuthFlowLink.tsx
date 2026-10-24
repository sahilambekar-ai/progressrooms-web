"use client";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ReactNode } from 'react';
export function AuthFlowLink({ destination, children }: { destination: 'login' | 'register'; children: ReactNode }) {
  const search = useSearchParams();
  const requested = search.get('next');
  const selectedPlan = search.get('plan');
  const purchaseNext = destination === 'login' && ['core', 'studio'].includes(selectedPlan || '') ? '/dashboard?tab=billing-saas' : null;
  const next = requested && requested.startsWith('/') && !requested.startsWith('//') && !/[\\\s]/.test(requested) ? requested : purchaseNext;
  const params = new URLSearchParams();
  if (next) {
    params.set('next', next);
    if (destination === 'register') params.set('role', next.startsWith('/dashboard') ? 'STUDIO' : 'STUDENT');
  }
  if (['starter', 'core', 'studio'].includes(selectedPlan || '')) params.set('plan', selectedPlan!);
  const href = `/${destination}${params.size ? `?${params.toString()}` : ''}`;
  return <Link className="text-xs font-semibold text-[#2D7A58] hover:underline" href={href}>{children}</Link>;
}
