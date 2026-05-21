"use client";

import Link from "next/link";
import { LayoutDashboard, Briefcase, Users, UserPlus, Sparkles, Shield } from "lucide-react";
import { AdminNavLink } from "@/components/layout/admin-nav-link";
import { NavLink } from "@/components/layout/nav-link";
import { UserMenu } from "@/components/layout/user-menu";

const workspaceNav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/candidates", label: "Candidates", icon: Users },
  { href: "/jobs", label: "Open roles", icon: Briefcase },
];

export function Sidebar() {
  return (
    <aside className="flex w-64 shrink-0 flex-col bg-brand text-brand-foreground shadow-lg shadow-brand/20">
      <div className="border-b border-white/10 px-5 py-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <Sparkles className="h-5 w-5 text-teal-200" strokeWidth={2} />
          </div>
          <div>
            <span className="text-base font-semibold tracking-tight">Recruitimate</span>
            <p className="text-[11px] font-medium text-brand-foreground/60">
              Hiring intelligence
            </p>
          </div>
        </Link>
      </div>

      <div className="flex flex-1 flex-col px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-brand-foreground/45">
          Workspace
        </p>
        <nav className="flex flex-col gap-0.5">
          {workspaceNav.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
          <AdminNavLink href="/admin" label="Platform admin" icon={Shield} />
        </nav>

        <p className="mb-2 mt-8 px-3 text-[10px] font-semibold uppercase tracking-widest text-brand-foreground/45">
          Intelligence
        </p>
        <div className="space-y-2 px-3">
          <IntelligenceHint
            label="Talent"
            desc="Pre-interview profiles"
            color="bg-violet-400/20 text-violet-100"
          />
          <IntelligenceHint
            label="Interview"
            desc="Signal analysis"
            color="bg-teal-400/20 text-teal-100"
          />
          <IntelligenceHint
            label="Decision"
            desc="Hire recommendations"
            color="bg-emerald-400/20 text-emerald-100"
          />
        </div>
      </div>

      <div className="p-4">
        <Link
          href="/candidates/new"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary-hover"
        >
          <UserPlus className="h-4 w-4" />
          Add candidate
        </Link>
      </div>
      <UserMenu />
    </aside>
  );
}

function IntelligenceHint({
  label,
  desc,
  color,
}: {
  label: string;
  desc: string;
  color: string;
}) {
  return (
    <div className={`rounded-md px-2.5 py-2 text-xs ${color}`}>
      <span className="font-semibold">{label}</span>
      <span className="block text-[10px] opacity-80">{desc}</span>
    </div>
  );
}
