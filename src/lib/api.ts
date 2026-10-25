import { PublicWebsitePayload, PublicSessionDetailPayload } from '@/types';

// Used by server-rendered tenant pages; remote preview modes need an absolute backend URL.
const API_BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function fetchPublicOrganization(orgSlug: string): Promise<PublicWebsitePayload | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/public/organizations/${orgSlug}`, {
      cache: 'no-store' // Published websites are visible immediately
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Failed to fetch public org ${orgSlug}:`, error);
    return null;
  }
}

export async function fetchPublicSession(orgSlug: string, sessionSlug: string): Promise<PublicSessionDetailPayload | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/public/organizations/${orgSlug}/classes/${sessionSlug}`, {
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Failed to fetch session ${sessionSlug}:`, error);
    return null;
  }
}
