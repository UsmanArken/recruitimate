import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

const TOKEN_KEY = "candidate_token";
const API_BASE = process.env.FASTAPI_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function serverCandidateFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_KEY)?.value;
  if (!token) {
    redirect(`/candidate/login?callbackUrl=${encodeURIComponent(path)}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Cookie: `${TOKEN_KEY}=${token}`,
      ...(options.headers as Record<string, string>),
    },
    cache: "no-store",
  });

  if (res.status === 401) {
    redirect("/candidate/login");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail ?? "Request failed");
  }

  return res.json();
}

export interface CandidateMe {
  id: string;
  name: string;
  email: string;
  jobId: string | null;
  status: string;
  linkedInUrl: string | null;
  githubUrl: string | null;
  talentProfile: {
    skills: string[];
    experienceYears: number | null;
  } | null;
  interviews: Array<{ id: string; title: string; scheduledAt: string | null; status: string }>;
}

export async function getCandidateMe(): Promise<CandidateMe> {
  try {
    return await serverCandidateFetch<CandidateMe>("/api/candidate/me");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    redirect("/candidate/login");
  }
}
