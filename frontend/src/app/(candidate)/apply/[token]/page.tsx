import { notFound } from "next/navigation";
import { ApplyForm } from "./apply-form";

const API_BASE = process.env.FASTAPI_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface ApplyInfo {
  jobTitle: string;
  jobDescription: string | null;
  jobPostDocument: string | null;
  orgName: string;
}

async function getApplyInfo(token: string): Promise<ApplyInfo | null> {
  try {
    const res = await fetch(`${API_BASE}/api/apply/${token}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ApplyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const info = await getApplyInfo(token);
  if (!info) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border px-6 py-4">
        <p className="text-sm font-semibold text-primary">Recruitimate</p>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-medium text-muted">{info.orgName}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">{info.jobTitle}</h1>
          {(info.jobPostDocument || info.jobDescription) && (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted">
              {info.jobPostDocument ?? info.jobDescription}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-foreground">Apply for this role</h2>
          <ApplyForm token={token} />
        </div>
      </main>
    </div>
  );
}
