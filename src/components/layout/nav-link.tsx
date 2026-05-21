"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavLink({
  href,
  label,
  icon: Icon,
  exact,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
        active
          ? "bg-white/12 text-white shadow-sm"
          : "text-brand-foreground/75 hover:bg-white/8 hover:text-white"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", active && "text-teal-200")} />
      {label}
      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-teal-300" aria-hidden />
      )}
    </Link>
  );
}
