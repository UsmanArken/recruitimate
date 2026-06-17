"use client";

const TOKEN_KEY = "candidate_token";
const USER_KEY = "recruitimate_candidate_user";

export interface CandidateUser {
  id: string;
  name: string;
  email: string;
  jobId: string | null;
}

export function getCandidateToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredCandidateUser(): CandidateUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCandidateAuth(token: string, user: CandidateUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  const maxAge = 30 * 24 * 60 * 60; // 30 days
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearCandidateAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
}
