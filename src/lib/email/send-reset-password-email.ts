import { Resend } from "resend";
import { ResetPasswordEmail } from "@/emails/reset-password-email";
import { EMAIL_FROM } from "./sender";

export async function sendResetPasswordEmail(to: string, username: string, url: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: "Cambia tu contraseña",
    react: ResetPasswordEmail({ username, url }),
  });
  if (error) throw new Error(`Resend rejected the password reset email: ${error.message}`);
}
