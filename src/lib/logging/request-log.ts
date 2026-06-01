export type ApiLogEntry = {
  level: "info" | "warn" | "error";
  requestId: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  phase?: "start" | "complete";
  code?: string;
  userId?: string;
  error?: string;
};

/** Edge- and Node-safe (Web Crypto API). */
export function createRequestId(): string {
  return crypto.randomUUID();
}

export function logApiRequest(entry: ApiLogEntry): void {
  const payload = {
    ts: new Date().toISOString(),
    type: "api_request",
    ...entry,
  };

  const line = JSON.stringify(payload);
  if (entry.level === "error") {
    console.error(line);
  } else if (entry.level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}
