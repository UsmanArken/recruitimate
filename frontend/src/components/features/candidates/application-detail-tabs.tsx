"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { IntelligencePhase } from "@/lib/intelligence/candidate-context";
import { Brain, Mic2, Scale } from "lucide-react";

const tabs = [
  { id: "screen" as const, label: "Screen", icon: Brain, desc: "Talent signals" },
  { id: "interview" as const, label: "Interview", icon: Mic2, desc: "Live assist & transcript" },
  { id: "decision" as const, label: "Decision", icon: Scale, desc: "Hire recommendation" },
];

export function ApplicationDetailTabs({
  phase,
  screen,
  interview,
  decision,
}: {
  phase: IntelligencePhase;
  screen: React.ReactNode;
  interview: React.ReactNode;
  decision: React.ReactNode;
}) {
  const defaultTab = phase === "ready_for_decision" ? "decision" : "screen";
  const [active, setActive] = useState<(typeof tabs)[number]["id"]>(defaultTab);

  const panels = { screen, interview, decision };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 rounded-xl border border-border-subtle bg-card p-1.5 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={cn(
                "flex min-w-[7.5rem] flex-1 items-center gap-2.5 rounded-lg px-4 py-3 text-left transition",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted hover:bg-background hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span>
                <span className="block text-sm font-semibold leading-tight">{tab.label}</span>
                <span
                  className={cn(
                    "block text-[10px] font-medium",
                    isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}
                >
                  {tab.desc}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <div key={active} className="tab-panel-enter">
        {panels[active]}
      </div>
    </div>
  );
}
