import { PublicWebsitePayload, PublicSessionDetailPayload } from '@/types';

// Used by server-rendered tenant pages; remote preview modes need an absolute backend URL.
const API_BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function fetchPublicOrganization(orgSlug: string): Promise<PublicWebsitePayload | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/public/organizations/${encodeURIComponent(orgSlug)}`, {
      cache: 'no-store', // Published websites are visible immediately
      signal: AbortSignal.timeout(15000),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Public organization request failed (${res.status})`);
    return await res.json();
  } catch (error) {
    console.error(`Failed to fetch public org ${orgSlug}:`, error);
    throw error;
  }
}

export async function fetchPublicSession(orgSlug: string, sessionSlug: string): Promise<PublicSessionDetailPayload | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/public/organizations/${encodeURIComponent(orgSlug)}/classes/${encodeURIComponent(sessionSlug)}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Public class request failed (${res.status})`);
    return await res.json();
  } catch (error) {
    console.error(`Failed to fetch session ${sessionSlug}:`, error);
    throw error;
  }
}
