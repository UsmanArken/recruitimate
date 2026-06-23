import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignalList } from "@/components/features/intelligence/signal-list";
import type { Signal } from "@/lib/intelligence/types";
import { ExternalLink, FileText, Github, Globe, Mail } from "lucide-react";

type GenericScreening = {
  skills?: string[];
  experienceYears?: number | null;
  strengths?: string[];
  gaps?: string[];
  hiddenSignals?: Signal[];
  explanation?: string;
};

export function CandidateSourceProfile({
  name,
  email,
  linkedInUrl,
  linkedInText,
  githubUrl,
  portfolioUrl,
  resumeText,
  sourceFileName,
  genericScreening,
}: {
  name: string;
  email: string | null;
  linkedInUrl: string | null;
  linkedInText: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  resumeText: string | null;
  sourceFileName: string | null;
  genericScreening: GenericScreening | null;
}) {
  const screening = genericScreening;
  const hiddenSignals = (screening?.hiddenSignals ?? []) as Signal[];

  return (
    <section className="mb-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile &amp; source materials</CardTitle>
          <CardDescription>
            What you uploaded for {name} — plus generic screening when not yet linked to a role.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            <ProfileField icon={Mail} label="Email" value={email} />
            <ProfileField icon={Globe} label="LinkedIn" value={linkedInUrl} isLink />
            <ProfileField icon={Github} label="GitHub" value={githubUrl} isLink />
            <ProfileField icon={Globe} label="Portfolio" value={portfolioUrl} isLink />
            {sourceFileName && (
              <div className="sm:col-span-2">
                <ProfileField icon={FileText} label="Uploaded file" value={sourceFileName} />
              </div>
            )}
          </dl>

          {screening && (
            <div className="rounded-xl border border-violet-200/60 bg-violet-50/40 p-4">
              <p className="text-sm font-semibold text-foreground">Generic talent screening</p>
              <p className="mt-1 text-xs text-muted">
                Resume evaluated without a specific open role — apply to a position for role-fit
                scoring.
              </p>
              {screening.skills && screening.skills.length > 0 && (
                <p className="mt-3 text-sm">
                  <span className="font-medium">Skills: </span>
                  {screening.skills.join(", ")}
                </p>
              )}
              {screening.experienceYears != null && (
                <p className="mt-2 text-sm text-muted">
                  ~{screening.experienceYears} years experience indicated
                </p>
              )}
              {screening.strengths && screening.strengths.length > 0 && (
                <ul className="mt-3 list-inside list-disc text-sm text-muted">
                  {screening.strengths.slice(0, 4).map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              )}
              {hiddenSignals.length > 0 && (
                <div className="mt-4">
                  <SignalList signals={hiddenSignals} />
                </div>
              )}
              {screening.explanation && (
                <p className="mt-3 text-sm italic leading-relaxed text-muted">
                  {screening.explanation}
                </p>
              )}
            </div>
          )}

          {resumeText && (
            <details className="group rounded-xl border border-border-subtle bg-background/60">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Resume text ({resumeText.length.toLocaleString()} characters)
                </span>
              </summary>
              <pre className="max-h-80 overflow-auto border-t border-border-subtle px-4 py-3 font-mono text-xs leading-relaxed text-muted whitespace-pre-wrap">
                {resumeText}
              </pre>
            </details>
          )}

          {linkedInText && (
            <details className="group rounded-xl border border-border-subtle bg-background/60">
              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-foreground">
                LinkedIn profile text
              </summary>
              <pre className="max-h-60 overflow-auto border-t border-border-subtle px-4 py-3 font-mono text-xs leading-relaxed text-muted whitespace-pre-wrap">
                {linkedInText}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function ProfileField({
  icon: Icon,
  label,
  value,
  isLink,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null;
  isLink?: boolean;
}) {
  if (!value) {
    return (
      <div>
        <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </dt>
        <dd className="mt-1 text-sm text-muted">—</dd>
      </div>
    );
  }

  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-foreground">
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            {value.replace(/^https?:\/\//, "").slice(0, 48)}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
