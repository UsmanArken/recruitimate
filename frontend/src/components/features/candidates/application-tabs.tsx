"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface Props {
  tabs: Tab[];
  rightPanel: React.ReactNode;
}

export function ApplicationTabs({ tabs, rightPanel }: Props) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? "");
  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <div className="flex flex-1 flex-col">

      {/* Tab bar — stacks below the identity header (~76px) */}
      <div className="sticky top-[76px] z-20 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center -mb-px">
            {tabs.map((tab) => {
              const isActive = activeId === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveId(tab.id)}
                  className={cn(
                    "relative px-5 py-3 text-xs font-semibold transition-colors duration-150",
                    isActive ? "text-primary" : "text-muted hover:text-foreground"
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      "absolute bottom-0 left-2 right-2 h-0.5 rounded-t-full transition-all duration-200",
                      isActive ? "bg-primary opacity-100" : "opacity-0"
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content + right panel */}
      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-7">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-start">

          {/* Left: tab content with fade-in */}
          <div key={activeId} className="min-w-0 flex-1 tab-panel-enter">
            {activeTab?.content}
          </div>

          {/* Right: verdict card — sticky below header + tab bar (~116px total) */}
          <div className="w-full shrink-0 lg:w-80 xl:w-96 lg:self-start lg:sticky lg:top-[116px]">
            {rightPanel}
          </div>

        </div>
      </div>
    </div>
  );
}
