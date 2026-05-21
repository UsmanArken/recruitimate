"use client";

import { useSession } from "next-auth/react";
import { NavLink } from "@/components/layout/nav-link";
import type { LucideIcon } from "lucide-react";

export function AdminNavLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
}) {
  const { data: session } = useSession();
  if (!session?.user?.isPlatformAdmin) return null;
  return <NavLink href={href} label={label} icon={icon} />;
}
