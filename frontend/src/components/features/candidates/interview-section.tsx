"use client";

import { useState } from "react";
import { ChevronDown, Mic2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { InterviewWorkflowPanel, type InterviewRow } from "./interview-workflow-panel";
import {
  InterviewAnalysisTabs,
  type InterviewAnalysisData,
} from "@/components/features/interview/interview-analysis-tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface AnalysedInterview {
  id: string;
  analysis: InterviewAnalysisData;
}

interface Props {
  analysedInterviews: AnalysedInterview[];
  applicationId: string;
  jobId: string;
  jobTitle: string;
  interviews: InterviewRow[];
}

export function InterviewSection({
  analysedInterviews,
  applicationId,
  jobId,
  jobTitle,
  interviews,
}: Props) {
  const [selectedId, setSelectedId] = useState<string>(analysedInterviews[0]?.id ?? "");
  const [showWorkflow, setShowWorkflow] = useState(false);

  const selected = analysedInterviews.find((i) => i.id === selectedId) ?? analysedInterviews[0];

  if (selected && !showWorkflow) {
    return (
      <div className="space-y-4">
        {/* Title row with optional interview picker */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">{selected.analysis.title}</p>
          <div className="flex items-center gap-3">
            {analysedInterviews.length > 1 && (
              <InterviewPicker
                interviews={analysedInterviews}
                selectedId={selectedId}
                onChange={setSelectedId}
              />
            )}
            <button
              type="button"
              onClick={() => setShowWorkflow(true)}
              className="flex items-center gap-1.5 text-xs text-muted transition hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              New interview
            </button>
          </div>
        </div>

        <InterviewAnalysisTabs data={selected.analysis} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-interview/20 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic2 className="h-5 w-5 text-interview" />
            Interview workspace
          </CardTitle>
          <CardDescription>
            Schedule and run an AI-assisted interview.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InterviewWorkflowPanel
            applicationId={applicationId}
            jobId={jobId}
            jobTitle={jobTitle}
            interviews={interviews}
          />
        </CardContent>
      </Card>
      {analysedInterviews.length > 0 && (
        <button
          type="button"
          onClick={() => setShowWorkflow(false)}
          className="flex items-center gap-1.5 text-xs text-muted transition hover:text-foreground"
        >
          <RotateCcw className="h-3 w-3" />
          Back to signal report
        </button>
      )}
    </div>
  );
}

function InterviewPicker({
  interviews,
  selectedId,
  onChange,
}: {
  interviews: AnalysedInterview[];
  selectedId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "appearance-none rounded-md border border-border-subtle bg-card py-1.5 pl-3 pr-7",
          "text-xs font-medium text-foreground shadow-sm",
          "focus:outline-none focus:ring-1 focus:ring-primary/50"
        )}
      >
        {interviews.map((i, idx) => (
          <option key={i.id} value={i.id}>
            {i.analysis.title || `Interview ${idx + 1}`}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
