import Link from "next/link";
import { PrivacyPolicyContent } from "@/components/PrivacyPolicy";

export const metadata = { title: "Privacy Policy | Progress Rooms" };
export default async function PrivacyPage({ searchParams: pendingSearchParams }: { searchParams: Promise<{ role?: string }> }) {
  const searchParams = await pendingSearchParams;
  return <main id="main-content" className="min-h-screen bg-[#FAF7F2] px-5 py-10">
    <article className="mx-auto max-w-3xl">
      <Link href="/" className="text-sm underline">Progress Rooms home</Link>
      <h1 className="my-6 text-3xl font-bold text-[#133623]">Progress Rooms Privacy Policy</h1>
      <PrivacyPolicyContent includeBoth audience={searchParams.role === "STUDENT" ? "STUDENT" : "STUDIO"} />
    </article>
  </main>;
}
