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

export interface ClassPackage {
  id: string;
  total_classes: number;
  price: number;
  offer_price?: number | null;
  validity_days: number;
}

export interface Pricing {
  packages?: ClassPackage[];
  pricing_type: 'ONE_TIME' | 'MONTHLY' | 'PACKAGE' | 'PER_SESSION';
  price: number;
  currency: string;
  total_classes?: number;
  validity_days?: number;
}

export interface PublicSession {
  instructor_name?: string;
  instructor_names?: string[];
  id: string;
  name: string;
  slug: string;
  full_description?: string;
  short_description?: string;
  session_type: string;
  skill_level: string;
  duration_minutes: number;
  capacity: number | null;
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
  capacity: number | null;
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
    capacity: number | null;
    enrolled_count: number;
    remaining_spots: number | null;
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
  class_packages?: { session_id: string; package_id: string; total_classes: number; class_name: string }[];
  classes: { id: string; name: string; total_classes?: number | null }[];
}

export interface ZoomConnectionSummary {
  zoom_host_id?: string | null;
  connection_id: string;
  member_id: string;
  email: string | null;
  display_name: string | null;
  status: string;
  version: number;
  is_simulated: boolean;
  production_ready: boolean;
  zoom_mail_authorized?: boolean;
}
export interface TeacherZoomState {
  fallback_host_is_owner?: boolean;
  zoom_connection_status: string;
  zoom_connection: ZoomConnectionSummary | null;
  zoom_verified_email: string | null;
  is_default_zoom_host: boolean;
  effective_zoom_host: ZoomConnectionSummary | null;
  zoom_ready: boolean;
  production_ready: boolean;
  start_responsibility: string;
}
