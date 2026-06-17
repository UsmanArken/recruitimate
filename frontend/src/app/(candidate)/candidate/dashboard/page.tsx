import { Suspense } from "react";
import { getCandidateMe } from "@/lib/api-candidate-server";
import { ProfileEditForm } from "./profile-edit-form";
import { LogoutButton } from "./logout-button";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  applied: { label: "Under Review", color: "bg-blue-100 text-blue-700" },
  shortlisted: { label: "Shortlisted", color: "bg-green-100 text-green-700" },
  rejected: { label: "Not Progressing", color: "bg-red-100 text-red-700" },
};

export default async function CandidateDashboardPage() {
  const me = await getCandidateMe();
  const statusInfo = STATUS_LABELS[me.status] ?? STATUS_LABELS.applied;

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
        {/* Application Status */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Application Status</h2>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
        </section>

        {/* Profile */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Your Profile</h2>

          {me.talentProfile && (
            <div className="mb-6 space-y-3">
              {me.talentProfile.experienceYears != null && (
                <p className="text-sm text-muted">
                  <span className="font-medium text-foreground">Experience:</span>{" "}
                  {me.talentProfile.experienceYears}{" "}
                  {me.talentProfile.experienceYears === 1 ? "year" : "years"}
                </p>
              )}
              {me.talentProfile.skills?.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {me.talentProfile.skills.map((skill) => (
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

        {/* Interviews */}
        {me.interviews?.length > 0 && (
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Interviews</h2>
            <ul className="space-y-3">
              {me.interviews.map((iv) => (
                <li
                  key={iv.id}
                  className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{iv.title}</p>
                    {iv.scheduledAt && (
                      <p className="mt-0.5 text-xs text-muted">
                        {new Date(iv.scheduledAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <span className="rounded-full bg-muted/40 px-2.5 py-0.5 text-xs capitalize text-muted-foreground">
                    {iv.status.toLowerCase()}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
