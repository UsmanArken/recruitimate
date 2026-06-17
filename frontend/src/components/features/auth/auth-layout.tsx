import { Brain, Mic2, Scale } from "lucide-react";
import { RecruitimateLogo } from "@/components/brand/recruitimate-logo";

const highlights = [
  {
    icon: Brain,
    label: "Talent intelligence",
    desc: "Role-fit and hidden signals before the interview",
    className: "bg-violet-400/15 text-violet-100",
  },
  {
    icon: Mic2,
    label: "Interview intelligence",
    desc: "Structured signals from every conversation",
    className: "bg-teal-400/15 text-teal-100",
  },
  {
    icon: Scale,
    label: "Decision intelligence",
    desc: "Explainable hire recommendations your team trusts",
    className: "bg-emerald-400/15 text-emerald-100",
  },
];

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-brand px-10 py-12 text-brand-foreground lg:flex xl:w-[42%]">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 20% 0%, rgba(45, 212, 191, 0.18), transparent 55%), radial-gradient(ellipse 70% 50% at 100% 100%, rgba(91, 77, 158, 0.2), transparent 50%)",
          }}
        />
        <div className="relative">
          <RecruitimateLogo
            href="/"
            size="lg"
            tagline="Hiring intelligence for HR teams"
          />
        </div>

        <div className="relative space-y-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-foreground/45">
              Three intelligence layers
            </p>
            <h2 className="mt-3 max-w-sm text-3xl font-bold leading-tight tracking-tight">
              Hire with clarity—not guesswork.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-foreground/70">
              One workspace for recruiters and hiring managers. AI assists every stage;
              your team stays in control of the decision.
            </p>
          </div>
          <ul className="space-y-3">
            {highlights.map((item) => (
              <li
                key={item.label}
                className={`flex gap-3 rounded-xl px-4 py-3 ring-1 ring-white/8 ${item.className}`}
              >
                <item.icon className="mt-0.5 h-5 w-5 shrink-0 opacity-90" />
                <div>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="mt-0.5 text-xs opacity-80">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-brand-foreground/40">
          Advisory intelligence — human judgment on every hire.
        </p>
      </aside>

      <main className="app-canvas flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10">
        <div className="mb-8 lg:hidden">
          <RecruitimateLogo href="/" variant="light" tagline="Hiring intelligence" />
        </div>

        <div className="w-full max-w-[420px]">
          <div className="rounded-2xl border border-border/80 bg-card p-8 shadow-xl shadow-brand/5 ring-1 ring-black/[0.03] sm:p-10">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted">{subtitle}</p>
            </div>
            {children}
          </div>
          <div className="mt-6 text-center text-sm text-muted">{footer}</div>
        </div>
      </main>
    </div>
  );
}
