"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  label: string;
}

interface Props {
  sections: Section[];
}

export function SectionNav({ sections }: Props) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const headings = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];

    if (!headings.length) return;

    const visible = new Map<string, number>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.intersectionRatio);
          } else {
            visible.delete(entry.target.id);
          }
        });

        if (visible.size > 0) {
          let topId = "";
          let topOffset = Infinity;
          visible.forEach((_, id) => {
            const el = document.getElementById(id);
            if (el && el.offsetTop < topOffset) {
              topOffset = el.offsetTop;
              topId = id;
            }
          });
          if (topId) setActiveId(topId);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    headings.forEach((el) => observerRef.current!.observe(el));
    return () => observerRef.current?.disconnect();
  }, [sections]);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    // header is ~120px tall now with the nav row included
    const top = el.getBoundingClientRect().top + window.scrollY - 128;
    window.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <div className="flex items-center gap-0.5 -mb-px">
      {sections.map((s) => {
        const isActive = activeId === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => scrollTo(s.id)}
            className={cn(
              "relative px-3 py-2 text-xs font-semibold transition-colors duration-150",
              isActive
                ? "text-primary"
                : "text-muted hover:text-foreground"
            )}
          >
            {s.label}
            {/* active underline sits on the header border */}
            <span
              className={cn(
                "absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full transition-opacity duration-150",
                isActive ? "bg-primary opacity-100" : "opacity-0"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
