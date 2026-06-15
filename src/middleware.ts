import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { logApiRequest } from "@/lib/logging/request-log";

const publicPaths = ["/login", "/signup", "/invite"];
const OPERATOR_BROWSE_COOKIE = "recruitimate-operator-browse";

/** Tenant hiring UI — not the platform operator home. */
function isHiringWorkspacePath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname.startsWith("/candidates")) return true;
  if (pathname.startsWith("/jobs")) return true;
  return false;
}

function operatorBrowseEnabled(req: NextRequest): boolean {
  if (req.nextUrl.searchParams.get("operatorBrowse") === "1") return true;
  return req.cookies.get(OPERATOR_BROWSE_COOKIE)?.value === "1";
}

function isPublicPath(pathname: string): boolean {
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  if (pathname.startsWith("/api/auth")) return true;
  if (pathname === "/api/invites/accept") return true;
  if (pathname.startsWith("/api/invites/") && pathname !== "/api/invites") {
    return true;
  }
  return false;
}

function attachRequestId(res: NextResponse, requestId: string): NextResponse {
  res.headers.set("x-request-id", requestId);
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api") && !pathname.startsWith("/api/auth");
  const requestId = isApi ? req.headers.get("x-request-id") ?? crypto.randomUUID() : null;

  if (isApi && requestId) {
    logApiRequest({
      level: "info",
      requestId,
      method: req.method,
      path: pathname,
      status: 0,
      durationMs: 0,
      phase: "start",
    });
  }

  const requestHeaders = new Headers(req.headers);
  if (requestId) requestHeaders.set("x-request-id", requestId);

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });
  const isLoggedIn = Boolean(token);

  if (!isLoggedIn && !isPublicPath(pathname)) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return requestId
      ? attachRequestId(NextResponse.redirect(login), requestId)
      : NextResponse.redirect(login);
  }

  if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
    const home = token?.isPlatformAdmin ? "/admin" : "/";
    return requestId
      ? attachRequestId(NextResponse.redirect(new URL(home, req.nextUrl.origin)), requestId)
      : NextResponse.redirect(new URL(home, req.nextUrl.origin));
  }

  if (
    isLoggedIn &&
    token?.isPlatformAdmin &&
    isHiringWorkspacePath(pathname) &&
    !operatorBrowseEnabled(req)
  ) {
    return requestId
      ? attachRequestId(NextResponse.redirect(new URL("/admin", req.nextUrl.origin)), requestId)
      : NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  if (
    isLoggedIn &&
    token?.isPlatformAdmin &&
    isHiringWorkspacePath(pathname) &&
    req.nextUrl.searchParams.get("operatorBrowse") === "1"
  ) {
    response.cookies.set(OPERATOR_BROWSE_COOKIE, "1", {
      path: "/",
      maxAge: 60 * 60 * 8,
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
  }

  return requestId ? attachRequestId(response, requestId) : response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
