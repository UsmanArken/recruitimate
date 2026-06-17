import { signIn } from "@/lib/auth";
import { db } from "@/lib/db";
import { DEMO_ORG_SLUG, demoEmail, demoPassword } from "@/lib/demo/constants";
import { syncDemoUserPassword } from "@/lib/demo/sync-demo-password";
import { NextResponse } from "next/server";

/** One-click demo login — credentials stay server-side. */
export async function GET() {
  const org = await db.organization.findUnique({ where: { slug: DEMO_ORG_SLUG } });
  if (!org) {
    return NextResponse.json(
      { error: "Demo workspace is not set up. Run npm run db:seed-demo on the server." },
      { status: 503 }
    );
  }

  await syncDemoUserPassword(demoPassword());

  return signIn("credentials", {
    email: demoEmail(),
    password: demoPassword(),
    redirectTo: "/",
  });
}

export async function POST() {
  return GET();
}
