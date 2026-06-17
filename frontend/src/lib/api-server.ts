import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

const TOKEN_KEY = "recruitimate_token";
// Server-side: always needs an absolute URL — use FASTAPI_URL (server-only env var)
const API_BASE = process.env.FASTAPI_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function serverFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_KEY)?.value;
  if (!token) {
    redirect(`/login?callbackUrl=${encodeURIComponent(path)}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string>),
    },
    cache: "no-store",
  });

  if (res.status === 401) {
    // Clear the stale cookie so middleware doesn't redirect back to this page
    cookieStore.delete(TOKEN_KEY);
    redirect("/login");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail ?? "Request failed");
  }

  return res.json();
}

export async function getAuthUser() {
  try {
    return await serverFetch<{
      id: string;
      email: string;
      name: string | null;
      organizationId: string | null;
      roleCode: string | null;
      isPlatformAdmin: boolean;
    }>("/api/auth/me");
  } catch (err) {
    // Re-throw Next.js redirect errors — swallowing them would break the redirect
    if (isRedirectError(err)) throw err;
    // For network errors (backend down), clear cookie and redirect to login
    const cookieStore = await cookies();
    cookieStore.delete(TOKEN_KEY);
    redirect("/login");
  }
}
