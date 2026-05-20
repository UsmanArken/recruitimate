import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  let jobs = [] as Array<
    Awaited<ReturnType<typeof db.job.findUnique>> & {
      _count: { candidates: number };
    }
  >;
  try {
    jobs = await db.job.findMany({
      include: { _count: { select: { candidates: true } } },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // DB not ready
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="text-sm text-muted">ATS-lite — create roles for fit scoring</p>
        </div>
        <Link
          href="/jobs/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          New job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted">
            No jobs yet. Create one to enable role fit scoring.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-muted">{job.description}</p>
                <p className="mt-3 text-xs text-muted">
                  {job._count.candidates} candidate{job._count.candidates !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
