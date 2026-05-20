import { Shield } from "lucide-react";

export function TrustBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-teal-200/80 bg-interview-bg px-4 py-3 text-sm text-foreground/90">
      <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
      <p className="leading-relaxed">{children}</p>
    </div>
  );
}
