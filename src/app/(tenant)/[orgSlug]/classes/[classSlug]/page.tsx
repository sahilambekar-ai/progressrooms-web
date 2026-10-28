import { notFound } from "next/navigation";
import { fetchPublicSession } from "@/lib/api";
import { SessionDetailClient } from "@/components/SessionDetailClient";
export default async function ClassDetailPage({ params: pendingParams }: { params: Promise<{ orgSlug: string; classSlug: string }> }) {
  const params = await pendingParams;
  const item = await fetchPublicSession(params.orgSlug, params.classSlug);
  if (!item) notFound();
  return <SessionDetailClient session={item} />;
}
