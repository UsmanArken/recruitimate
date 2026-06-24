import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, FileText, Github, Globe, Mail } from "lucide-react";

export function CandidateSourceProfile({
  name,
  email,
  linkedInUrl,
  githubUrl,
  portfolioUrl,
  resumeText,
}: {
  name: string;
  email: string | null;
  linkedInUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  resumeText: string | null;
}) {
  const hasAnyLink = email || linkedInUrl || githubUrl || portfolioUrl;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profile &amp; source materials</CardTitle>
        <CardDescription>
          Contact details and uploaded resume for {name}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {hasAnyLink && (
          <dl className="grid gap-4 sm:grid-cols-2">
            <ProfileField icon={Mail} label="Email" value={email} />
            <ProfileField icon={Globe} label="LinkedIn" value={linkedInUrl} isLink />
            <ProfileField icon={Github} label="GitHub" value={githubUrl} isLink />
            <ProfileField icon={Globe} label="Portfolio" value={portfolioUrl} isLink />
          </dl>
        )}

        {resumeText && (
          <details className="rounded-xl border border-border-subtle bg-background/60">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
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

        {!hasAnyLink && !resumeText && (
          <p className="text-sm text-muted">No source materials on file.</p>
        )}
      </CardContent>
    </Card>
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
