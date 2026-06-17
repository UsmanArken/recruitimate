import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";
type LogoTone = "on-dark" | "on-light";

const iconSizes: Record<LogoSize, string> = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-11 w-11",
};

const textSizes: Record<LogoSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

function LogoMark({
  className,
  size = "md",
}: {
  className?: string;
  size?: LogoSize;
  tone?: LogoTone;
}) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10",
        iconSizes[size],
        className
      )}
    >
      <svg viewBox="0 0 48 48" fill="none" className="h-full w-full" aria-hidden>
        <rect width="48" height="48" rx="12" fill="#162F4A" />
        <circle cx="20" cy="18" r="6" fill="#0B6B82" />
        <path
          d="M10 34c2.5-6 6-9 10-9s7.5 3 10 9"
          stroke="#5EEAD4"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M32 30l6-8 6 8"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function RecruitimateLogo({
  size = "md",
  tagline,
  href = "/",
  className,
  variant = "sidebar",
}: {
  size?: LogoSize;
  tagline?: string;
  href?: string;
  className?: string;
  variant?: "sidebar" | "light";
}) {
  const isLight = variant === "light";

  return (
    <Link href={href} className={cn("flex items-center gap-3", className)}>
      <LogoMark size={size} tone={isLight ? "on-light" : "on-dark"} />
      <div className="min-w-0">
        <span
          className={cn(
            "block font-bold tracking-tight",
            textSizes[size],
            isLight ? "text-foreground" : "text-white"
          )}
        >
          <span className={isLight ? "text-brand" : "text-white"}>Recruit</span>
          <span className={isLight ? "text-primary" : "text-teal-300"}>imate</span>
        </span>
        {tagline && (
          <p
            className={cn(
              "truncate text-[11px] font-medium",
              isLight ? "text-muted" : "text-brand-foreground/75"
            )}
          >
            {tagline}
          </p>
        )}
      </div>
    </Link>
  );
}

export function RecruitimateIcon({
  className,
}: {
  className?: string;
  tone?: LogoTone;
}) {
  return <LogoMark className={className} size="sm" />;
}
