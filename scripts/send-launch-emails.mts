// Tells every verified account that the simulator is open.
// `pnpm email:launch` only counts recipients; add `--send` to email them.
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { user } from "@/lib/db/schema";
import { sendLaunchEmails } from "@/lib/email/send-launch-emails";

const recipients = await db
  .select({ email: user.email, name: user.name })
  .from(user)
  .where(eq(user.emailVerified, true))
  .orderBy(asc(user.createdAt), asc(user.id));

if (!process.argv.includes("--send")) {
  console.log(`${recipients.length} verified accounts would be emailed. Rerun with --send.`);
} else {
  await sendLaunchEmails(recipients, new URL("/login", process.env.BETTER_AUTH_URL).href);
  console.log(`Launch email sent to ${recipients.length} accounts.`);
}
