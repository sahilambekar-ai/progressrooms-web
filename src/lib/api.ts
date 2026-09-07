import { PublicWebsitePayload, PublicSessionDetailPayload } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function fetchPublicOrganization(orgSlug: string): Promise<PublicWebsitePayload | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/public/organizations/${orgSlug}`, {
      next: { revalidate: 60 } // Next.js ISR/SSR
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
    const res = await fetch(`${API_BASE_URL}/public/organizations/${orgSlug}/sessions/${sessionSlug}`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Failed to fetch session ${sessionSlug}:`, error);
    return null;
  }
}
