import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { notFound } from "next/navigation";
import { Calendar, Clock, Users, ArrowRight, CheckCircle2, Globe, Shield } from "lucide-react";
import { fetchPublicOrganization } from "@/lib/api";
import { PublicWebsitePayload } from "@/types";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Fallback seed data for instant SSR preview
const FALLBACK_ORGS: Record<string, PublicWebsitePayload> = {
  "sahil-yoga-studio": {
    organization: {
      id: "org-sahil-001",
      name: "Sahil Yoga Studio",
      slug: "sahil-yoga-studio",
      timezone: "Asia/Kolkata",
      currency: "INR"
    },
    website: {
      template_code: "DEFAULT",
      headline: "Cultivate Stillness, Strength & Breath",
      subheadline: "Authentic daily Hatha flow, Aerial conditioning, and Himalayan breathwork classes in Bangalore & Online.",
      about_text: "Sahil Yoga Studio is a holistic wellness sanctuary dedicated to alignment, breath awareness, and graceful mobility. Whether you are unrolling a mat for the first time or soaring in silks, welcome home.",
      primary_color: "#133623",
      accent_color: "#81A882"
    },
    instructors: [
      { name: "Sahil Sharma", role: "OWNER", title: "Founder & Lead Guru", bio: "Certified Hatha & Vinyasa master with 12+ years experience." },
      { name: "Ananya Sen", role: "INSTRUCTOR", title: "Aerial Specialist", bio: "Aerial silks and restorative yoga practitioner." },
      { name: "Rohit Verma", role: "INSTRUCTOR", title: "Pranayama Coach", bio: "Mindfulness and breathwork guide." }
    ],
    class_types: [
      { id: "ct-1", name: "Hatha Yoga", slug: "hatha-yoga" },
      { id: "ct-2", name: "Aerial Yoga", slug: "aerial-yoga" },
      { id: "ct-3", name: "Meditation & Pranayama", slug: "meditation" }
    ],
    sessions: [
      {
        id: "sess-1",
        name: "Morning Hatha Flow",
        slug: "morning-hatha-flow",
        short_description: "Energizing 60-minute daily alignment and pranayama to elevate your day.",
        session_type: "GROUP",
        skill_level: "ALL_LEVELS",
        duration_minutes: 60,
        capacity: 25,
        pricing: { pricing_type: "MONTHLY", price: 2500, currency: "INR" },
        schedule: [
          { day_of_week: 0, start_time: "07:00:00", end_time: "08:00:00" },
          { day_of_week: 2, start_time: "07:00:00", end_time: "08:00:00" },
          { day_of_week: 4, start_time: "07:00:00", end_time: "08:00:00" }
        ]
      },
      {
        id: "sess-2",
        name: "Aerial Yoga Conditioning",
        slug: "aerial-yoga-conditioning",
        short_description: "Suspended silks workout combining acrobatic strength and spinal decompression.",
        session_type: "GROUP",
        skill_level: "INTERMEDIATE",
        duration_minutes: 60,
        capacity: 12,
        pricing: { pricing_type: "MONTHLY", price: 3500, currency: "INR" },
        schedule: [
          { day_of_week: 1, start_time: "18:00:00", end_time: "19:00:00" },
          { day_of_week: 3, start_time: "18:00:00", end_time: "19:00:00" }
        ]
      }
    ]
  },
  "john-guitar-academy": {
    organization: {
      id: "org-john-002",
      name: "John Guitar Academy",
      slug: "john-guitar-academy",
      timezone: "Asia/Kolkata",
      currency: "INR"
    },
    website: {
      template_code: "DEFAULT",
      headline: "Learn Acoustic & Electric Guitar from Masters",
      subheadline: "Structured weekly lessons in rock, blues, fingerpicking, and music theory.",
      about_text: "John Guitar Academy offers modern contemporary guitar instruction for all age groups.",
      primary_color: "#0f766e",
      accent_color: "#f59e0b"
    },
    instructors: [
      { name: "John Mayer", role: "OWNER", title: "Academy Director", bio: "Grammy-winning musician & instructor." }
    ],
    class_types: [
      { id: "ct-g1", name: "Acoustic Guitar", slug: "acoustic-guitar" }
    ],
    sessions: [
      {
        id: "sess-g1",
        name: "Beginner Guitar Chords & Rhythms",
        slug: "beginner-guitar-chords",
        short_description: "Master open chords, strumming patterns, and your first 10 popular songs.",
        session_type: "GROUP",
        skill_level: "BEGINNER",
        duration_minutes: 60,
        capacity: 15,
        pricing: { pricing_type: "MONTHLY", price: 2000, currency: "INR" },
        schedule: [
          { day_of_week: 5, start_time: "10:00:00", end_time: "11:00:00" },
          { day_of_week: 6, start_time: "10:00:00", end_time: "11:00:00" }
        ]
      }
    ]
  }
};

export default async function TenantPublicPage({ params }: { params: { orgSlug: string } }) {
  const data = (await fetchPublicOrganization(params.orgSlug)) || FALLBACK_ORGS[params.orgSlug];

  if (!data) {
    notFound();
  }

  const { organization, website, instructors, class_types, sessions } = data;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Studio Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
              style={{ backgroundColor: website.primary_color }}
            >
              {organization.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">{organization.name}</h1>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Globe className="h-3 w-3" /> progressrooms.com/{organization.slug}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/student"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Student Portal
            </Link>
            <a
              href="#classes"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm transition"
              style={{ backgroundColor: website.primary_color }}
            >
              View Classes
            </a>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section id="main-content" className="bg-white border-b py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-4">
            <Shield className="h-3.5 w-3.5 text-indigo-600" /> Verified ProgressNow Partner
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {website.headline}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            {website.subheadline}
          </p>
          {website.about_text && (
            <p className="mt-4 text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
              {website.about_text}
            </p>
          )}
        </div>
      </section>

      {/* Instructors Showcase */}
      {instructors.length > 0 && (
        <section className="py-12 px-4 sm:px-6 max-w-6xl mx-auto w-full">
          <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase mb-6">
            Meet Your Instructors
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {instructors.map((inst, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start space-x-4">
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center font-bold text-white text-lg shrink-0"
                  style={{ backgroundColor: website.primary_color }}
                >
                  {inst.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{inst.name}</h4>
                  <p className="text-xs text-indigo-600 font-medium">{inst.title || inst.role}</p>
                  {inst.bio && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{inst.bio}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sessions / Classes Section */}
      <section id="classes" className="py-12 px-4 sm:px-6 max-w-6xl mx-auto w-full flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-4 border-b">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Available Classes</h3>
            <p className="text-sm text-slate-500 mt-1">Select a session to view details, prerequisites, and enroll.</p>
          </div>
          {class_types.length > 0 && (
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 text-white cursor-pointer">
                All Classes
              </span>
              {class_types.map((ct) => (
                <span key={ct.id} className="px-3 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer">
                  {ct.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 uppercase tracking-wider">
                    {sess.session_type}
                  </span>
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {sess.duration_minutes} mins
                  </span>
                </div>

                <h4 className="text-xl font-bold text-slate-900 mt-3">{sess.name}</h4>
                <p className="text-sm text-slate-600 mt-2">{sess.short_description}</p>

                {/* Schedule preview */}
                {sess.schedule.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5 items-center">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 mr-1" />
                    {sess.schedule.map((rule, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 font-medium">
                        {DAY_NAMES[rule.day_of_week]} @ {rule.start_time.slice(0, 5)}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Pricing</p>
                  <p className="text-lg font-black text-slate-900">
                    {sess.pricing?.currency === "INR" ? "₹" : "$"}
                    {sess.pricing?.price?.toLocaleString()}
                    <span className="text-xs font-normal text-slate-500"> / {sess.pricing?.pricing_type?.toLowerCase()}</span>
                  </p>
                </div>
                <Link
                  href={`/${organization.slug}/sessions/${sess.slug}`}
                  className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm transition"
                  style={{ backgroundColor: website.primary_color }}
                >
                  View Details <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8 px-4 text-center text-xs text-slate-400">
        <Link href="/" aria-label="ProgressNow home" className="inline-flex mb-3"><BrandLogo size={36} /></Link>
        <p>© {new Date().getFullYear()} {organization.name}. Powered by <Link href="/" className="font-semibold text-slate-600 underline">ProgressNow</Link>.</p>
      </footer>
    </div>
  );
}
