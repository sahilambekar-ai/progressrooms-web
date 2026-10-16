"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TeacherPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code") || params.get("teacher");
    if (code) {
      router.replace(`/student?teacher=${encodeURIComponent(code)}`);
    } else {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F4F7F4] flex items-center justify-center p-8 text-[#133623]">
      <p className="font-serif text-lg">Redirecting to sanctuary studio dashboard…</p>
    </div>
  );
}
