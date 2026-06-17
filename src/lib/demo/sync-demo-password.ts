import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { demoEmail } from "@/lib/demo/constants";

/** Keep demo login password aligned with DEMO_USER_PASSWORD after env changes. */
export async function syncDemoUserPassword(password: string): Promise<void> {
  const email = demoEmail();
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return;

  const passwordHash = await bcrypt.hash(password, 12);
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
}
