export type EmailProviderId = "log" | "smtp";

export function resolveEmailProviderId(): EmailProviderId {
  const raw = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  if (raw === "smtp") return "smtp";
  return "log";
}

export function notificationsEnabled(): boolean {
  const raw = process.env.NOTIFICATIONS_ENABLED?.trim().toLowerCase();
  if (raw === "false" || raw === "0") return false;
  return true;
}

export function emailFromAddress(): string {
  return process.env.EMAIL_FROM?.trim() || "notifications@recruitimate.local";
}

export function smtpConfig() {
  return {
    host: process.env.SMTP_HOST?.trim() ?? "",
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER?.trim() ?? "",
    pass: process.env.SMTP_PASS?.trim() ?? "",
    secure: process.env.SMTP_SECURE === "true",
  };
}

export function isSmtpConfigured(): boolean {
  const cfg = smtpConfig();
  return Boolean(cfg.host && cfg.user && cfg.pass);
}

export function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    "http://localhost:3000"
  );
}
