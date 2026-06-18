import { getCandidateMe } from "@/lib/api-candidate-server";
import { ProfileEditForm } from "./profile-edit-form";
import { LogoutButton } from "./logout-button";

const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  NEW: { label: "Under Review", color: "bg-blue-100 text-blue-700" },
  TALENT_REVIEW: { label: "Under Review", color: "bg-blue-100 text-blue-700" },
  SHORTLISTED: { label: "Shortlisted", color: "bg-green-100 text-green-700" },
  INTERVIEW_SCHEDULED: { label: "Interview Scheduled", color: "bg-purple-100 text-purple-700" },
  INTERVIEWED: { label: "Interviewed", color: "bg-purple-100 text-purple-700" },
  DECISION: { label: "Final Decision", color: "bg-yellow-100 text-yellow-700" },
  HIRED: { label: "Hired", color: "bg-green-100 text-green-700" },
  REJECTED: { label: "Not Progressing", color: "bg-red-100 text-red-700" },
};

export default async function CandidateDashboardPage() {
  const me = await getCandidateMe();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <p className="text-sm font-semibold text-primary">Recruitimate</p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">{me.name}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
        {/* Applications */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Your Applications</h2>
          {me.applications.length === 0 ? (
            <p className="text-sm text-muted">No applications yet.</p>
          ) : (
            <ul className="space-y-3">
              {me.applications.map((app) => {
                const stageInfo = STAGE_LABELS[app.stage] ?? STAGE_LABELS.NEW;
                return (
                  <li
                    key={app.id}
                    className="rounded-xl border border-border px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {app.jobTitle ?? "Role"}
                        </p>
                        {app.interviews.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {app.interviews.map((iv) => (
                              <li key={iv.id} className="flex items-center gap-2 text-xs text-muted">
                                <span className="font-medium text-foreground">{iv.title}</span>
                                {iv.scheduledAt && (
                                  <span>— {new Date(iv.scheduledAt).toLocaleString()}</span>
                                )}
                                {iv.meetingUrl && (
                                  <a
                                    href={iv.meetingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-1 text-primary underline"
                                  >
                                    Join
                                  </a>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <span
                        className={`shrink-0 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${stageInfo.color}`}
                      >
                        {stageInfo.label}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Profile */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Your Profile</h2>

          {(me.experienceYears != null || (me.skills && me.skills.length > 0)) && (
            <div className="mb-6 space-y-3">
              {me.experienceYears != null && (
                <p className="text-sm text-muted">
                  <span className="font-medium text-foreground">Experience:</span>{" "}
                  {me.experienceYears}{" "}
                  {me.experienceYears === 1 ? "year" : "years"}
                </p>
              )}
              {me.skills && me.skills.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {me.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs text-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <ProfileEditForm
            initialName={me.name}
            initialEmail={me.email}
            initialLinkedInUrl={me.linkedInUrl ?? ""}
            initialGithubUrl={me.githubUrl ?? ""}
          />
        </section>
      </main>
    </div>
  );
}
