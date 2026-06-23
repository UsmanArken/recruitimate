"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { NAVIGATION_START_EVENT } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function NavigationProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(false);
  }, [pathname]);

  useEffect(() => {
    const onStart = () => setActive(true);
    window.addEventListener(NAVIGATION_START_EVENT, onStart);
    return () => window.removeEventListener(NAVIGATION_START_EVENT, onStart);
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none fixed left-64 right-0 top-0 z-[100] h-1 overflow-hidden bg-primary/10 transition-opacity duration-200",
        active ? "opacity-100" : "opacity-0"
      )}
      aria-hidden={!active}
    >
      <div
        className={cn(
          "h-full w-1/3 bg-primary shadow-sm shadow-primary/40",
          active && "animate-[navigation-bar_1.1s_ease-in-out_infinite]"
        )}
      />
    </div>
  );
}
