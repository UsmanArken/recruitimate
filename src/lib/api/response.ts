import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logApiRequest, createRequestId } from "@/lib/logging/request-log";
import { isAppError } from "./errors";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonCreated<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function handleRouteError(error: unknown, meta?: { method?: string; path?: string }): NextResponse {
  const requestId = createRequestId();

  if (isAppError(error)) {
    logApiRequest({
      level: error.status >= 500 ? "error" : "warn",
      requestId,
      method: meta?.method ?? "UNKNOWN",
      path: meta?.path ?? "UNKNOWN",
      status: error.status,
      durationMs: 0,
      phase: "complete",
      code: error.code,
      error: error.message,
    });
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status, headers: { "X-Request-Id": requestId } }
    );
  }

  if (error instanceof ZodError) {
    logApiRequest({
      level: "warn",
      requestId,
      method: meta?.method ?? "UNKNOWN",
      path: meta?.path ?? "UNKNOWN",
      status: 400,
      durationMs: 0,
      phase: "complete",
      code: "VALIDATION_ERROR",
    });
    return NextResponse.json(
      { error: "Validation failed", code: "VALIDATION_ERROR", details: error.flatten() },
      { status: 400, headers: { "X-Request-Id": requestId } }
    );
  }

  logApiRequest({
    level: "error",
    requestId,
    method: meta?.method ?? "UNKNOWN",
    path: meta?.path ?? "UNKNOWN",
    status: 500,
    durationMs: 0,
    phase: "complete",
    code: "INTERNAL_ERROR",
    error: error instanceof Error ? error.message : String(error),
  });
  return NextResponse.json(
    { error: "Internal server error", code: "INTERNAL_ERROR" },
    { status: 500, headers: { "X-Request-Id": requestId } }
  );
}
