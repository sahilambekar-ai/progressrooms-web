import Link from "next/link";
import { PrivacyPolicyContent } from "@/components/PrivacyPolicy";

export const metadata = { title: "Privacy Policy | ProgressRooms" };
export default function PrivacyPage({ searchParams }: { searchParams: { role?: string } }) {
  return <main id="main-content" className="min-h-screen bg-[#FAF7F2] px-5 py-10">
    <article className="mx-auto max-w-3xl">
      <Link href="/" className="text-sm underline">ProgressRooms home</Link>
      <h1 className="my-6 text-3xl font-bold text-[#133623]">ProgressRooms Privacy Policy</h1>
      <PrivacyPolicyContent includeBoth audience={searchParams.role === "STUDENT" ? "STUDENT" : "STUDIO"} />
    </article>
  </main>;
}
