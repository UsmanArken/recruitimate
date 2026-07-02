import { chatJson } from "@/lib/intelligence/ai";
import { normalizeJobDraft } from "@/lib/jobs/normalize-job-draft";
import { handleRouteError, jsonOk } from "@/lib/api/response";
import { requireApiAuth } from "@/lib/api/context";
import { parseJsonBody } from "@/lib/api/request";
import { z } from "zod";
import * as hiringClientService from "@/lib/services/hiring-client.service";

const draftSchema = z.object({
  title: z.string().min(1),
});

type JobDraft = {
  description: string;
  requirements: string;
  jobPostDocument: string;
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireApiAuth();
    const { id } = await params;
    const { title } = await parseJsonBody(req, draftSchema);
    const client = await hiringClientService.getHiringClientById(ctx, id);

    const fallback: JobDraft = {
      description: `${title} at ${client.name}. ${client.companyProfile?.slice(0, 500) ?? ""}`.trim(),
      requirements: "Define must-have skills and experience in the editor.",
      jobPostDocument: `We're hiring a ${title} at ${client.name}.\n\n${client.companyProfile ?? ""}`.trim(),
    };

    const prompt = `Company: ${client.name}
Website: ${client.website ?? "n/a"}
Company profile:
${client.companyProfile ?? "Not provided"}

Role title: ${title}

Generate a job requisition draft as JSON:
{
  "description": "internal role summary for recruiters",
  "requirements": "bullet-style must-haves for fit scoring",
  "jobPostDocument": "public job post copy candidates would read"
}`;

    const draft = normalizeJobDraft(
      await chatJson<JobDraft>(
        "You are a recruiting copywriter. Output valid JSON only.",
        prompt,
        fallback
      )
    );

    return jsonOk(draft);
  } catch (error) {
    return handleRouteError(error);
  }
}
