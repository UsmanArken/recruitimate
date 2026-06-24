"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Check, ChevronRight, Mic2, UserPlus, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DISMISS_KEY = "recruitimate-onboarding-dismissed";

type Step = {
  id: string;
  label: string;
  detail: string;
  href: string;
  done: boolean;
  icon: typeof Briefcase;
};

export function GettingStartedCard({
  hasRole,
  hasCandidate,
  hasInterview,
}: {
  hasRole: boolean;
  hasCandidate: boolean;
  hasInterview: boolean;
}) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  const steps: Step[] = [
    {
      id: "role",
      label: "Post an open position",
      detail: "Define the role and requirements for role-fit scoring.",
      href: "/jobs/new",
      done: hasRole,
      icon: Briefcase,
    },
    {
      id: "candidate",
      label: "Add your first applicant",
      detail: "Upload a resume and link them to that hiring campaign.",
      href: "/candidates/new",
      done: hasCandidate,
      icon: UserPlus,
    },
    {
      id: "interview",
      label: "Record an interview",
      detail: "Paste a transcript to unlock hire intelligence for the committee.",
      href: hasCandidate ? "/candidates" : "/candidates/new",
      done: hasInterview,
      icon: Mic2,
    },
  ];

  const allDone = steps.every((s) => s.done);
  if (dismissed || allDone) return null;

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  return (
    <Card className="mb-8 border-primary/25 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-lg">Get started with Recruitimate</CardTitle>
          <CardDescription>
            Three steps to run your first hiring campaign — talent screening, interview signals,
            and an advisory hire recommendation.
          </CardDescription>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-md p-1 text-muted hover:bg-card hover:text-foreground"
          aria-label="Dismiss getting started guide"
        >
          <X className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent className="space-y-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <Link
              key={step.id}
              href={step.href}
              className="flex items-center gap-4 rounded-lg border border-border/80 bg-card px-4 py-3 transition hover:border-primary/30 hover:shadow-sm"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  step.done ? "bg-success text-white" : "bg-brand/10 text-brand"
                }`}
              >
                {step.done ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">{step.label}</span>
                <span className="block text-xs text-muted">{step.detail}</span>
              </span>
              <Icon className="h-4 w-4 shrink-0 text-muted" />
              <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
