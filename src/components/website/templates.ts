export type WebsiteImage = { id: string; url: string; alt: string };
export type WebsiteCard = { title: string; text: string; image_id: string | null };
export type WebsiteSection = { id: string; title: string; description: string; cards: WebsiteCard[] };
export type WebsiteContent = {
  template_code: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  about_title: string;
  about_text: string;
  cta_title: string;
  cta_text: string;
  images: WebsiteImage[];
  sections: WebsiteSection[];
  hero_image_url: string;
  primary_color: string;
  accent_color: string;
};
export type WebsiteTemplate = { code: string; name: string; description: string; layout: string; ink: string; background: string; accent: string; content: WebsiteContent };
export type WebsiteRelease = { version: string; template_code: string; created_at: string; image_count: number; section_count: number };
export const MAX_IMAGES = 5;
export const MAX_CARDS = 9;
export const MAX_SECTIONS = 12;
export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
export function imageUrl(url: string) {
  return url.startsWith('/api/v1/') ? `${API.replace(/\/api\/v1\/?$/, '')}${url}` : url;
}
