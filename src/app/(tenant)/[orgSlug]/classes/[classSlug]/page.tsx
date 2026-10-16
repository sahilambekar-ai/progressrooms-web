import { notFound } from "next/navigation";
import { fetchPublicSession } from "@/lib/api";
import { SessionDetailClient } from "@/components/SessionDetailClient";
export default async function ClassDetailPage({ params }: { params: { orgSlug: string; classSlug: string } }) {
  const item = await fetchPublicSession(params.orgSlug, params.classSlug);
  if (!item) notFound();
  return <SessionDetailClient session={item} />;
}
