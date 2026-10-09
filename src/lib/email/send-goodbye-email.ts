import { Resend } from "resend";
import { GoodbyeEmail } from "@/emails/goodbye-email";
import { EMAIL_FROM } from "./sender";

export async function sendGoodbyeEmail(to: string, username: string, url: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: "Tu cuenta se ha eliminado",
    react: GoodbyeEmail({ username, url }),
  });
  if (error) throw new Error(`Resend rejected the goodbye email: ${error.message}`);
}
