"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main id="main-content" className="mx-auto flex min-h-[80dvh] w-full max-w-lg flex-col justify-center px-5 py-10">
    <BrandLogo size={48} showText />
    <div className="card-nature mt-6 p-5 sm:p-8" role="alert">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">We couldn’t load this page. Try again, or return home to continue.</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={reset} className="btn-forest px-5 py-3">Try again</button>
        <Link href="/" className="btn-sage inline-flex justify-center px-5 py-3">Back to home</Link>
      </div>
    </div>
  </main>;
}
