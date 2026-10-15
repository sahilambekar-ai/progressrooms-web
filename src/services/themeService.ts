'use client';

export interface DashboardFont {
  id: string;
  name: string;
  headingFamily: string;
  bodyFamily: string;
  category: 'Serif & Clean' | 'Modern SaaS' | 'Warm Geometric' | 'Editorial' | 'High-End Boutique';
  description: string;
  googleFontQuery: string;
}

export const DEFAULT_FONT_ID = 'lora-opensans';

export const PROFESSIONAL_FONTS: DashboardFont[] = [
  {
    id: 'lora-opensans',
    name: 'Lora',
    headingFamily: "'Lora', Georgia, serif",
    bodyFamily: "'Lora', Georgia, serif",
    category: 'Editorial',
    description: 'Consistent Lora typography for headings, labels, controls, and dashboard content.',
    googleFontQuery: 'Lora:wght@400;500;600;700',
  },
  {
    id: 'cormorant-manrope',
    name: 'Cormorant Garamond + Manrope',
    headingFamily: "'Cormorant Garamond', Georgia, serif",
    bodyFamily: "'Manrope', -apple-system, sans-serif",
    category: 'Editorial',
    description: 'Serene editorial serif for titles with ultra-clean, readable sans-serif body.',
    googleFontQuery: 'Cormorant+Garamond:wght@400;500;600;700&family=Manrope:wght@300;400;500;600;700',
  },
  {
    id: 'playfair-inter',
    name: 'Playfair Display + Inter',
    headingFamily: "'Playfair Display', Georgia, serif",
    bodyFamily: "'Inter', -apple-system, sans-serif",
    category: 'Serif & Clean',
    description: 'Sophisticated luxury serif headings with crisp modern system body font.',
    googleFontQuery: 'Playfair+Display:wght@500;600;700&family=Inter:wght@300;400;500;600;700',
  },
  {
    id: 'plus-jakarta',
    name: 'Plus Jakarta Sans',
    headingFamily: "'Plus Jakarta Sans', sans-serif",
    bodyFamily: "'Plus Jakarta Sans', sans-serif",
    category: 'Modern SaaS',
    description: 'Sleek, contemporary enterprise typography engineered for clean dashboards.',
    googleFontQuery: 'Plus+Jakarta+Sans:wght@400;500;600;700;800',
  },
  {
    id: 'outfit-dmsans',
    name: 'Outfit + DM Sans',
    headingFamily: "'Outfit', sans-serif",
    bodyFamily: "'DM Sans', sans-serif",
    category: 'Warm Geometric',
    description: 'Approachable, warm geometric curves with high clarity for timetables.',
    googleFontQuery: 'Outfit:wght@400;500;600;700&family=DM+Sans:wght@400;500;700',
  },

  {
    id: 'cinzel-montserrat',
    name: 'Cinzel + Montserrat',
    headingFamily: "'Cinzel', Georgia, serif",
    bodyFamily: "'Montserrat', sans-serif",
    category: 'High-End Boutique',
    description: 'Classical temple proportions inspired by architectural heritage.',
    googleFontQuery: 'Cinzel:wght@500;600;700&family=Montserrat:wght@300;400;500;600',
  },
];

const FONT_STORAGE_KEY = 'progressrooms_active_font';

class ThemeService {
  public getActiveFontId(): string {
    if (typeof window === 'undefined') return DEFAULT_FONT_ID;
    try {
      return localStorage.getItem(FONT_STORAGE_KEY) || DEFAULT_FONT_ID;
    } catch {
      return DEFAULT_FONT_ID;
    }
  }

  public getActiveFont(): DashboardFont {
    const id = this.getActiveFontId();
    return PROFESSIONAL_FONTS.find((f) => f.id === id) || PROFESSIONAL_FONTS[0];
  }

  public applyFont(fontId: string): DashboardFont {
    const font = PROFESSIONAL_FONTS.find((f) => f.id === fontId) || PROFESSIONAL_FONTS[0];
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(FONT_STORAGE_KEY, font.id);
      } catch (e) {
        console.warn('Unable to persist font to localStorage:', e);
      }

      const isDefault = font.id === DEFAULT_FONT_ID;
      const isCormorant = font.id === 'cormorant-manrope';
      let linkElement = document.getElementById('dynamic-progressrooms-font') as HTMLLinkElement | null;
      if (isDefault || isCormorant) {
        // The root layout already self-hosts these families with next/font.
        linkElement?.remove();
      } else {
        if (!linkElement) {
          linkElement = document.createElement('link');
          linkElement.id = 'dynamic-progressrooms-font';
          linkElement.rel = 'stylesheet';
          document.head.appendChild(linkElement);
        }
        const href = `https://fonts.googleapis.com/css2?family=${font.googleFontQuery}&display=swap`;
        if (linkElement.getAttribute('href') !== href) linkElement.href = href;
      }

      const root = document.documentElement;
      const headingFamily = isDefault ? `var(--font-lora), ${font.headingFamily}` : isCormorant ? `var(--font-cormorant), ${font.headingFamily}` : font.headingFamily;
      const bodyFamily = isDefault ? `var(--font-lora), ${font.bodyFamily}` : isCormorant ? `var(--font-manrope), ${font.bodyFamily}` : font.bodyFamily;
      root.style.setProperty('--font-serif', headingFamily);
      root.style.setProperty('--font-sans', bodyFamily);
      root.style.fontFamily = bodyFamily;

      // Dispatch custom event for real-time reactivity across components
      window.dispatchEvent(new CustomEvent('progressrooms_font_changed', { detail: font }));
    }
    return font;
  }

  public initFont() {
    if (typeof window === 'undefined') return;
    try {
      // Replace the previously auto-saved default once; keep explicit alternatives.
      if (!localStorage.getItem('progressrooms_lora_default_applied')) {
        if (localStorage.getItem(FONT_STORAGE_KEY) === 'cormorant-manrope') {
          localStorage.removeItem(FONT_STORAGE_KEY);
        }
        localStorage.setItem('progressrooms_lora_default_applied', '1');
      }
    } catch { /* The default also works without browser storage. */ }
    this.applyFont(this.getActiveFontId());
  }
}

export const themeService = new ThemeService();
