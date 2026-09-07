import { notFound } from "next/navigation";
import { fetchPublicSession } from "@/lib/api";
import { PublicSessionDetailPayload } from "@/types";
import { SessionDetailClient } from "@/components/SessionDetailClient";

const FALLBACK_SESSIONS: Record<string, PublicSessionDetailPayload> = {
  "morning-hatha-flow": {
    id: "sess-1",
    name: "Morning Hatha Flow",
    slug: "morning-hatha-flow",
    short_description: "Energizing 60-minute daily alignment and pranayama to elevate your day.",
    full_description: "Start your mornings grounded, centered, and energized. This class blends traditional Surya Namaskar with focused hip-opening, core stability, and 10 minutes of cooling Himalayan breathwork.",
    session_type: "GROUP",
    capacity: 25,
    min_age: 12,
    skill_level: "ALL_LEVELS",
    duration_minutes: 60,
    language: "English",
    organization: {
      id: "org-sahil-001",
      name: "Sahil Yoga Studio",
      slug: "sahil-yoga-studio",
      timezone: "Asia/Kolkata",
      currency: "INR"
    },
    class_type: "Hatha Yoga",
    pricing: {
      pricing_type: "MONTHLY",
      price: 2500,
      currency: "INR",
      validity_days: 30
    },
    requirements: {
      prerequisites: "Open to all practitioners. No prior flexibility or yoga experience required.",
      required_equipment: "Standard yoga mat, 2 foam blocks, and comfortable breathable clothing.",
      preparation_instructions: "Avoid heavy meals 2 hours prior to practice. Hydrate 30 minutes before class."
    },
    instructors: [
      { name: "Sahil Sharma", role: "PRIMARY", title: "Founder & Lead Guru" }
    ],
    schedule: [
      { day_of_week: 0, start_time: "07:00:00", end_time: "08:00:00" },
      { day_of_week: 2, start_time: "07:00:00", end_time: "08:00:00" },
      { day_of_week: 4, start_time: "07:00:00", end_time: "08:00:00" }
    ]
  },
  "aerial-yoga-conditioning": {
    id: "sess-2",
    name: "Aerial Yoga Conditioning",
    slug: "aerial-yoga-conditioning",
    short_description: "Suspended silks workout combining acrobatic strength and spinal decompression.",
    full_description: "Take flight and relieve spinal compression. Our Aerial Yoga program uses suspended silk hammocks to deepen stretches, safely access inversions, and tone stabilizing muscles.",
    session_type: "GROUP",
    capacity: 12,
    skill_level: "INTERMEDIATE",
    duration_minutes: 60,
    language: "English",
    organization: {
      id: "org-sahil-001",
      name: "Sahil Yoga Studio",
      slug: "sahil-yoga-studio",
      timezone: "Asia/Kolkata",
      currency: "INR"
    },
    class_type: "Aerial Yoga",
    pricing: {
      pricing_type: "MONTHLY",
      price: 3500,
      currency: "INR",
      validity_days: 30
    },
    requirements: {
      prerequisites: "Comfortable with basic bodyweight planks.",
      required_equipment: "Fitted clothing with sleeves (no zippers or sharp jewelry)."
    },
    instructors: [
      { name: "Ananya Sen", role: "PRIMARY", title: "Aerial Specialist" }
    ],
    schedule: [
      { day_of_week: 1, start_time: "18:00:00", end_time: "19:00:00" },
      { day_of_week: 3, start_time: "18:00:00", end_time: "19:00:00" }
    ]
  }
};

export default async function SessionDetailPage({
  params,
}: {
  params: { orgSlug: string; sessionSlug: string };
}) {
  const session =
    (await fetchPublicSession(params.orgSlug, params.sessionSlug)) ||
    FALLBACK_SESSIONS[params.sessionSlug];

  if (!session) {
    notFound();
  }

  return <SessionDetailClient session={session} />;
}
