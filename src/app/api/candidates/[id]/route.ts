import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const candidate = await db.candidate.findUnique({
    where: { id },
    include: {
      job: true,
      talentProfile: true,
      decision: true,
      interviews: { include: { analysis: true }, orderBy: { createdAt: "desc" } },
      notes: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!candidate) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(candidate);
}
