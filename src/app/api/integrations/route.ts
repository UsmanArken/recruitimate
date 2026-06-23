import { jsonOk } from "@/lib/api/response";

/** Integration catalog — connect API keys in a future release. */
const INTEGRATIONS = [
  {
    id: "linkedin",
    name: "LinkedIn Recruiter",
    description: "Publish job posts and source candidates (coming soon).",
    status: "planned" as const,
  },
  {
    id: "indeed",
    name: "Indeed",
    description: "Post job ads and ingest applicant CVs (coming soon).",
    status: "planned" as const,
  },
  {
    id: "greenhouse",
    name: "Greenhouse",
    description: "Sync requisitions and candidates with your ATS (coming soon).",
    status: "planned" as const,
  },
  {
    id: "lever",
    name: "Lever",
    description: "Push JDs and pull pipeline updates (coming soon).",
    status: "planned" as const,
  },
  {
    id: "glassdoor",
    name: "Glassdoor / company research",
    description: "Employer brand signals for JD copy and interviewer scripts (planned with company web consent).",
    status: "planned" as const,
  },
];

export async function GET() {
  return jsonOk({ integrations: INTEGRATIONS });
}
