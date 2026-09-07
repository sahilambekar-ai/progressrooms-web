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

export const PROFESSIONAL_FONTS: DashboardFont[] = [
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
    id: 'lora-opensans',
    name: 'Lora + Open Sans',
    headingFamily: "'Lora', Georgia, serif",
    bodyFamily: "'Open Sans', sans-serif",
    category: 'Editorial',
    description: 'Balanced calligraphic elegance with friendly open curves for mindful reading.',
    googleFontQuery: 'Lora:wght@400;500;600;700&family=Open+Sans:wght@300;400;500;600;700',
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
    if (typeof window === 'undefined') return 'cormorant-manrope';
    return localStorage.getItem(FONT_STORAGE_KEY) || 'cormorant-manrope';
  }

  public getActiveFont(): DashboardFont {
    const id = this.getActiveFontId();
    return PROFESSIONAL_FONTS.find((f) => f.id === id) || PROFESSIONAL_FONTS[0];
  }

  public applyFont(fontId: string): DashboardFont {
    const font = PROFESSIONAL_FONTS.find((f) => f.id === fontId) || PROFESSIONAL_FONTS[0];
    if (typeof window !== 'undefined') {
      localStorage.setItem(FONT_STORAGE_KEY, font.id);

      // Dynamically load Google Font link
      let linkElement = document.getElementById('dynamic-progressrooms-font') as HTMLLinkElement;
      if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.id = 'dynamic-progressrooms-font';
        linkElement.rel = 'stylesheet';
        document.head.appendChild(linkElement);
      }
      linkElement.href = `https://fonts.googleapis.com/css2?family=${font.googleFontQuery}&display=swap`;

      // Apply CSS font variables to root
      const root = document.documentElement;
      root.style.setProperty('--font-serif', font.headingFamily);
      root.style.setProperty('--font-sans', font.bodyFamily);
      root.style.fontFamily = font.bodyFamily;

      // Dispatch custom event for real-time reactivity across components
      window.dispatchEvent(new CustomEvent('progressrooms_font_changed', { detail: font }));
    }
    return font;
  }

  public initFont() {
    if (typeof window === 'undefined') return;
    this.applyFont(this.getActiveFontId());
  }
}

export const themeService = new ThemeService();
