import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";

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

function LogoMark({ className, size = "md" }: { className?: string; size?: LogoSize }) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/10",
        iconSizes[size],
        className
      )}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className="h-full w-full"
        aria-hidden
      >
        <rect width="64" height="64" rx="14" fill="#162F4A" />
        <rect x="8" y="12" width="22" height="28" rx="6" fill="#0B6B82" />
        <circle cx="19" cy="22" r="4.5" fill="#F0F7FC" />
        <path
          d="M12 36c1.5-4 4-6 7-6s5.5 2 7 6"
          stroke="#F0F7FC"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path d="M30 34h6" stroke="#F0F7FC" strokeWidth="2" strokeLinecap="round" />
        <circle cx="30" cy="34" r="2.2" fill="#F0F7FC" />
        <circle cx="36" cy="34" r="2.2" fill="#F0F7FC" />
        <rect x="38" y="38" width="5" height="10" rx="1.5" fill="#0B6B82" />
        <rect x="45" y="32" width="5" height="16" rx="1.5" fill="#0B6B82" />
        <path
          d="M52 26v14h5"
          stroke="#0B6B82"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M52 26l3 3-3 3"
          stroke="#0B6B82"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M32 18h8M34 14h6M36 10h4"
          stroke="#5548A0"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.9"
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
  variant?: "sidebar" | "light" | "full";
}) {
  if (variant === "full") {
    return (
      <Link href={href} className={cn("inline-flex items-center", className)}>
        <Image
          src="/brand/recruitimate-logo.png"
          alt="Recruitimate"
          width={280}
          height={64}
          className="h-10 w-auto"
          priority
        />
      </Link>
    );
  }

  const isLight = variant === "light";

  return (
    <Link href={href} className={cn("flex items-center gap-3", className)}>
      <LogoMark
        size={size}
        className={isLight ? "bg-brand ring-brand/10" : undefined}
      />
      <div className="min-w-0">
        <span
          className={cn(
            "block font-semibold tracking-tight",
            textSizes[size],
            isLight ? "text-foreground" : "text-brand-foreground"
          )}
        >
          <span className={isLight ? "text-brand" : undefined}>Recruit</span>
          <span className={isLight ? "text-primary" : "text-teal-200"}>imate</span>
        </span>
        {tagline && (
          <p
            className={cn(
              "truncate text-[11px] font-medium",
              isLight ? "text-muted" : "text-brand-foreground/60"
            )}
          >
            {tagline}
          </p>
        )}
      </div>
    </Link>
  );
}

export function RecruitimateIcon({ className }: { className?: string }) {
  return <LogoMark className={className} size="sm" />;
}
