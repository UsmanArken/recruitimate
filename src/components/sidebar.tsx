import Link from "next/link";
import { LayoutDashboard, Briefcase, Users, Plus } from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/candidates", label: "Candidates", icon: Users },
];

export function Sidebar() {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-5 py-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">Recruitimate</span>
        </Link>
        <p className="mt-1 text-xs text-muted">AI-Native Hiring OS</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground/80 transition hover:bg-muted/40 hover:text-foreground"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <Link
          href="/candidates/new"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add candidate
        </Link>
      </div>
    </aside>
  );
}
