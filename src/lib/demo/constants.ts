export const DEMO_ORG_SLUG = "acme-demo";
export const DEMO_ORG_NAME = "Acme Robotics (Demo)";
export const DEMO_USER_EMAIL_DEFAULT = "demo@recruitimate.app";
export const DEMO_USER_PASSWORD_DEFAULT = "DemoRecruit2026!";

/** Demo login email (server). Override with DEMO_USER_EMAIL in production. */
export function demoEmail(): string {
  return (
    process.env.DEMO_USER_EMAIL?.trim().toLowerCase() ?? DEMO_USER_EMAIL_DEFAULT
  );
}

/** Demo login password (server only — never expose via NEXT_PUBLIC). */
export function demoPassword(): string {
  return process.env.DEMO_USER_PASSWORD ?? DEMO_USER_PASSWORD_DEFAULT;
}

/** Public demo email for client-side banner checks (email is not secret). */
export function publicDemoEmail(): string {
  return (
    process.env.NEXT_PUBLIC_DEMO_EMAIL?.trim().toLowerCase() ??
    process.env.DEMO_USER_EMAIL?.trim().toLowerCase() ??
    DEMO_USER_EMAIL_DEFAULT
  );
}

export function isReservedDemoEmail(email: string): boolean {
  return email.toLowerCase() === demoEmail();
}

export function isDemoUserEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase() === publicDemoEmail();
}
