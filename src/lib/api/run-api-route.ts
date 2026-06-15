import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { createRequestId, logApiRequest } from "@/lib/logging/request-log";

export async function runApiRoute(
  req: Request,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const requestId = req.headers.get("x-request-id") ?? createRequestId();
  const start = Date.now();
  const method = req.method;
  const path = new URL(req.url).pathname;
  let status = 500;
  let code: string | undefined;
  let userId: string | undefined;

  try {
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    });
    userId = token?.sub;
  } catch {
    // unauthenticated routes still log
  }

  try {
    const res = await handler();
    status = res.status;

    try {
      const clone = res.clone();
      const body = await clone.json();
      if (body && typeof body === "object" && "code" in body && typeof body.code === "string") {
        code = body.code;
      }
    } catch {
      // non-JSON body
    }

    const headers = new Headers(res.headers);
    headers.set("X-Request-Id", requestId);

    logApiRequest({
      level: status >= 500 ? "error" : status >= 400 ? "warn" : "info",
      requestId,
      method,
      path,
      status,
      durationMs: Date.now() - start,
      phase: "complete",
      code,
      userId,
    });

    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    });
  } catch (error) {
    logApiRequest({
      level: "error",
      requestId,
      method,
      path,
      status,
      durationMs: Date.now() - start,
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
