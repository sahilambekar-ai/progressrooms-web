export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  timezone: string;
  currency: string;
}

export interface WebsiteConfig {
  template_code: string;
  is_published?: boolean;
  headline: string;
  subheadline: string;
  hero_image_url?: string;
  about_text?: string;
  primary_color: string;
  accent_color: string;
  social_links?: Record<string, string>;
}

export interface Instructor {
  name: string;
  role: string;
  title?: string;
  bio?: string;
  avatar_url?: string;
}

export interface ClassType {
  id: string;
  name: string;
  slug: string;
}

export interface ScheduleRule {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface Pricing {
  pricing_type: 'ONE_TIME' | 'MONTHLY' | 'PACKAGE' | 'PER_SESSION';
  price: number;
  currency: string;
  total_classes?: number;
  validity_days?: number;
}

export interface PublicSession {
  id: string;
  name: string;
  slug: string;
  short_description?: string;
  session_type: string;
  skill_level: string;
  duration_minutes: number;
  capacity: number;
  remaining_spots?: number;
  delivery_mode?: string;
  pricing?: Pricing;
  schedule: ScheduleRule[];
}

export interface PublicWebsitePayload {
  organization: Organization;
  website: WebsiteConfig;
  instructors: Instructor[];
  class_types: ClassType[];
  sessions: PublicSession[];
  passes: PublicPass[];
}

export interface PublicSessionDetailPayload {
  id: string;
  name: string;
  slug: string;
  short_description?: string;
  full_description?: string;
  session_type: string;
  capacity: number;
  min_age?: number;
  max_age?: number;
  skill_level: string;
  duration_minutes: number;
  language: string;
  organization: Organization;
  class_type?: string;
  pricing?: Pricing;
  requirements?: {
    prerequisites?: string;
    required_equipment?: string;
    preparation_instructions?: string;
    additional_notes?: string;
  };
  delivery_mode?: string;
  venue?: {
    name: string;
    address: string;
    city?: string;
    delivery_mode?: string;
  };
  next_occurrence?: {
    id: string;
    start_time: string;
    end_time: string;
  } | null;
  availability?: {
    capacity: number;
    enrolled_count: number;
    remaining_spots: number;
    is_full: boolean;
  };
  cancellation_terms?: string;
  meeting_readiness?: string;
  renewal_terms?: string;
  instructors: Instructor[];
  schedule: ScheduleRule[];
}

export interface PublicPass {
  id: string; name: string; description?: string; price: number; offer_price?: number | null; currency: string;
  tier_type: string; validity_days: number; total_classes?: number;
  classes: { id: string; name: string }[];
}
