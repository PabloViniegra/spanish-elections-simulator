import { Resend } from "resend";
import { VerifyEmail } from "@/emails/verify-email";

const from = "Simulador de Elecciones <no-reply@send.pabloviniegra.dev>";

export async function sendVerificationEmail(to: string, username: string, url: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from,
    to,
    subject: "Confirma tu correo electrónico",
    react: VerifyEmail({ username, url }),
  });
  if (error) throw new Error(`Resend rejected the verification email: ${error.message}`);
}
