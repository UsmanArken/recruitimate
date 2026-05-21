import { requireAuthContext } from "@/lib/auth/session";

export async function requireApiAuth() {
  return requireAuthContext();
}
