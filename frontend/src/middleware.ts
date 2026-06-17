import { NextRequest, NextResponse } from "next/server";

const RECRUITER_PUBLIC_PATHS = ["/login", "/signup", "/invite"];
const CANDIDATE_PUBLIC_PATHS = ["/apply", "/candidate/login"];
const TOKEN_KEY = "recruitimate_token";
const CANDIDATE_TOKEN_KEY = "candidate_token";

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" && payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Candidate portal routes ---
  if (pathname.startsWith("/candidate/") || pathname.startsWith("/apply/")) {
    const isCandidatePublic = CANDIDATE_PUBLIC_PATHS.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    );

    const rawCandidateToken = request.cookies.get(CANDIDATE_TOKEN_KEY)?.value;
    const candidateToken = rawCandidateToken && !isTokenExpired(rawCandidateToken) ? rawCandidateToken : null;

    if (!isCandidatePublic) {
      if (rawCandidateToken && !candidateToken) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/candidate/login";
        loginUrl.searchParams.set("callbackUrl", pathname);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete(CANDIDATE_TOKEN_KEY);
        return response;
      }

      if (!candidateToken) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/candidate/login";
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Redirect already-authenticated candidates away from login
    if (candidateToken && pathname === "/candidate/login") {
      const dashUrl = request.nextUrl.clone();
      dashUrl.pathname = "/candidate/dashboard";
      dashUrl.search = "";
      return NextResponse.redirect(dashUrl);
    }

    return NextResponse.next();
  }

  // --- Recruiter routes ---
  const isPublic = RECRUITER_PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  const rawToken = request.cookies.get(TOKEN_KEY)?.value;
  const token = rawToken && !isTokenExpired(rawToken) ? rawToken : null;

  if (rawToken && !token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("callbackUrl", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(TOKEN_KEY);
    return response;
  }

  if (!isPublic && !token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && (pathname === "/login" || pathname === "/signup")) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
