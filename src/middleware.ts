import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });
  const isLoggedIn = Boolean(token);

  if (!isLoggedIn && !isPublicPath(pathname)) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
    const home = token?.isPlatformAdmin ? "/admin" : "/";
    return NextResponse.redirect(new URL(home, req.nextUrl.origin));
  }

  if (
    isLoggedIn &&
    token?.isPlatformAdmin &&
    isHiringWorkspacePath(pathname) &&
    !operatorBrowseEnabled(req)
  ) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }

  const response = NextResponse.next();

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

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
