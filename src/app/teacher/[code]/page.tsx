"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function TeacherCodePage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const code = params?.code;
    if (code) {
      router.replace(`/student?teacher=${encodeURIComponent(String(code))}`);
    } else {
      router.replace("/student");
    }
  }, [params, router]);

  return (
    <div className="min-h-screen bg-[#F4F7F4] flex items-center justify-center p-8 text-[#133623]">
      <p className="font-serif text-lg">Loading teacher profile…</p>
    </div>
  );
}
