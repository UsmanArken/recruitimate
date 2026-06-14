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
  tone = "on-dark",
}: {
  className?: string;
  size?: LogoSize;
  tone?: LogoTone;
}) {
  const onDark = tone === "on-dark";

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-sm",
        iconSizes[size],
        onDark
          ? "bg-white ring-1 ring-white/20"
          : "bg-white ring-1 ring-border shadow-md shadow-brand/5",
        className
      )}
    >
      <svg viewBox="0 0 48 48" fill="none" className="h-[82%] w-[82%]" aria-hidden>
        {/* Person */}
        <rect x="5" y="10" width="15" height="20" rx="4" fill="#162F4A" />
        <circle cx="12.5" cy="16.5" r="3.2" fill="#F0F7FC" />
        <path
          d="M8 27c1.2-2.8 2.8-4 4.5-4s3.3 1.2 4.5 4"
          stroke="#F0F7FC"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Connection */}
        <circle cx="22.5" cy="24" r="1.6" fill="#0B6B82" />
        <path d="M21 24h3.5" stroke="#0B6B82" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="25.5" cy="24" r="1.6" fill="#0B6B82" />
        {/* Growth bars */}
        <rect x="28" y="28" width="4" height="8" rx="1.2" fill="#0B6B82" />
        <rect x="33.5" y="24" width="4" height="12" rx="1.2" fill="#0B6B82" />
        <rect x="39" y="18" width="4" height="18" rx="1.2" fill="#14B8D4" />
        <path
          d="M41 14v4M41 14l-1.8 1.8M41 14l1.8 1.8"
          stroke="#14B8D4"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Intelligence accent */}
        <path
          d="M22 12h5M23 9h4M24 6.5h2.5"
          stroke="#5548A0"
          strokeWidth="1.4"
          strokeLinecap="round"
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
  const tone: LogoTone = isLight ? "on-light" : "on-dark";

  return (
    <Link href={href} className={cn("flex items-center gap-3", className)}>
      <LogoMark size={size} tone={tone} />
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
  tone = "on-dark",
}: {
  className?: string;
  tone?: LogoTone;
}) {
  return <LogoMark className={className} size="sm" tone={tone} />;
}
