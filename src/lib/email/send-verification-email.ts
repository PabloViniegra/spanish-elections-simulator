import { Resend } from "resend";
import { VerifyEmail } from "@/emails/verify-email";
import { EMAIL_FROM } from "./sender";

export async function sendVerificationEmail(to: string, username: string, url: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: "Confirma tu correo electrónico",
    react: VerifyEmail({ username, url }),
  });
  if (error) throw new Error(`Resend rejected the verification email: ${error.message}`);
}
