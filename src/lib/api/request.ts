import type { ZodType, output } from "zod";

export async function parseJsonBody<S extends ZodType>(
  req: Request,
  schema: S
): Promise<output<S>> {
  const body = await req.json().catch(() => ({}));
  return schema.parse(body);
}
