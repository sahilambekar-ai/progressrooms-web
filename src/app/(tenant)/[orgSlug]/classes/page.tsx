import { redirect } from 'next/navigation';
export default function Classes({ params }: { params: { orgSlug: string } }) {
  redirect(`/${encodeURIComponent(params.orgSlug)}/explore`);
}
