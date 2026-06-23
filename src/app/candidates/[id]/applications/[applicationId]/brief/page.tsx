import { notFound } from "next/navigation";
import { requireAuthContext } from "@/lib/auth/session";
import { getApplicationById } from "@/lib/services/application.service";
import { buildCandidateBrief } from "@/lib/intelligence/brief/candidate-brief";
import { CandidateBriefDocument } from "@/components/features/candidates/candidate-brief-document";

export const dynamic = "force-dynamic";

export default async function CandidateBriefPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; applicationId: string }>;
  searchParams: Promise<{ print?: string }>;
}) {
  const { id: candidateId, applicationId } = await params;
  const { print } = await searchParams;

  let application: Awaited<ReturnType<typeof getApplicationById>> | null = null;

  try {
    const ctx = await requireAuthContext();
    application = await getApplicationById(ctx, applicationId);
  } catch {
    notFound();
  }

  if (!application || application.candidateId !== candidateId) notFound();

  const brief = buildCandidateBrief(application);

  return <CandidateBriefDocument brief={brief} autoPrint={print === "1"} />;
}
