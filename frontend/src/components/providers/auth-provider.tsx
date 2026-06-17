"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiFetch } from "@/lib/api-fetch";
import { AuthUser, clearAuth, getStoredUser, getToken, setAuth } from "@/lib/auth-client";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
      setIsLoading(false);
      return;
    }
    // Validate token with backend
    apiFetch<AuthUser>("/api/auth/me")
      .then((me) => {
        setUser(me);
      })
      .catch(() => {
        clearAuth();
      })
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { access_token } = await apiFetch<{ access_token: string }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    );
    // Store token first so apiFetch /me gets the auth header
    localStorage.setItem("recruitimate_token", access_token);
    const me = await apiFetch<AuthUser>("/api/auth/me");
    setAuth(access_token, me);
    setUser(me);
  }, []);

  const signOut = useCallback(() => {
    clearAuth();
    setUser(null);
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// Drop-in replacement for next-auth's useSession shape
export function useSession() {
  const { user, isLoading } = useAuth();
  return {
    data: user ? { user } : null,
    status: isLoading ? "loading" : user ? "authenticated" : "unauthenticated",
  };
}
