import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export default function NotFound() {
  return <main id="main-content" className="mx-auto flex min-h-[80dvh] w-full max-w-lg flex-col justify-center px-5 py-10">
    <BrandLogo size={48} showText />
    <div className="card-nature mt-6 p-5 sm:p-8">
      <p className="text-sm font-semibold text-[#618D63]">404 · Page not found</p>
      <h1 className="mt-2 text-3xl font-bold">Let’s get you back on track</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">This page may have moved, or the studio link may be incorrect.</p>
      <Link href="/" className="btn-forest mt-6 inline-flex justify-center px-5 py-3">Back to home</Link>
    </div>
  </main>;
}
