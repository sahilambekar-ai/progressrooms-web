import { permanentRedirect } from "next/navigation";
export default function LegacyClassLink({ params }: { params: { orgSlug: string; sessionSlug: string } }) {
  permanentRedirect(`/${params.orgSlug}/classes/${params.sessionSlug}`);
}
