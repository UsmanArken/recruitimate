"use client";

import { useState } from "react";
import { Copy, CheckCheck, Link2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  signupToken: string;
  interviewMode: string;
}

export function SignupLinkCard({ signupToken, interviewMode }: Props) {
  const [copied, setCopied] = useState(false);

  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/apply/${signupToken}`;

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary" />
          Candidate signup link
        </CardTitle>
        <CardDescription>
          Share this link with candidates to apply for this role.{" "}
          {interviewMode === "automated" && (
            <span className="font-medium text-primary">Automated AI interview enabled.</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
          <span className="flex-1 truncate font-mono text-sm text-foreground">{url}</span>
          <button
            onClick={copy}
            className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted"
          >
            {copied ? (
              <CheckCheck className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
