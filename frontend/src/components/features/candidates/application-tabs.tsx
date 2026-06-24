"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Brain, Mic2, Scale } from "lucide-react";

const TAB_META: Record<string, { icon: React.ElementType; desc: string }> = {
  talent:   { icon: Brain, desc: "Talent signals" },
  interview: { icon: Mic2,  desc: "Live assist & transcript" },
  decision:  { icon: Scale, desc: "Hire recommendation" },
};

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface Props {
  tabs: Tab[];
  rightPanel?: React.ReactNode;
  phaseBanner?: React.ReactNode;
}

export function ApplicationTabs({ tabs, rightPanel, phaseBanner }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paramTab = searchParams.get("tab");
  const validIds = tabs.map((t) => t.id);
  const initial = validIds.includes(paramTab ?? "") ? (paramTab as string) : (tabs[0]?.id ?? "");

  const [activeId, setActiveId] = useState(initial);

  useEffect(() => {
    const next = searchParams.get("tab");
    if (next && validIds.includes(next)) setActiveId(next);
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  function switchTab(id: string) {
    setActiveId(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", id);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <div className="flex flex-1 flex-col">

      {/* Phase banner — sits between identity header and tabs */}
      {phaseBanner}

      {/* Tab bar — stacks below the identity header (~76px) */}
      <div className="sticky top-[76px] z-20 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <div className="flex flex-wrap gap-2 rounded-xl border border-border-subtle bg-background p-1.5 shadow-sm">
            {tabs.map((tab) => {
              const meta = TAB_META[tab.id];
              const Icon = meta?.icon;
              const isActive = activeId === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => switchTab(tab.id)}
                  className={cn(
                    "flex min-w-[7.5rem] flex-1 items-center gap-2.5 rounded-lg px-4 py-3 text-left transition",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted hover:bg-card hover:text-foreground"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />}
                  <span>
                    <span className="block text-sm font-semibold leading-tight">{tab.label}</span>
                    {meta?.desc && (
                      <span
                        className={cn(
                          "block text-[10px] font-medium",
                          isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                        )}
                      >
                        {meta.desc}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-7">
        {rightPanel ? (
          <div className="flex flex-col gap-7 lg:flex-row lg:items-start">
            <div key={activeId} className="min-w-0 flex-1 tab-panel-enter">
              {activeTab?.content}
            </div>
            <div className="w-full shrink-0 lg:w-80 xl:w-96 lg:self-start lg:sticky lg:top-[148px]">
              {rightPanel}
            </div>
          </div>
        ) : (
          <div key={activeId} className="tab-panel-enter">
            {activeTab?.content}
          </div>
        )}
      </div>
    </div>
  );
}
