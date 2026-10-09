import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordFormContainer } from "@/components/auth/forgot-password-form-container";

export const metadata: Metadata = { title: "Recuperar la contraseña" };

type ForgotPasswordPageProps = {
  searchParams: Promise<{ sent?: string }>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const { sent } = await searchParams;
  return (
    <AuthCard
      title="Recupera tu contraseña"
      description="Te enviaremos un enlace para elegir una contraseña nueva."
      footer={
        <>
          ¿La recuerdas?{" "}
          <Link href="/login" className="text-primary underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      {sent ? (
        <p role="status" className="text-body text-ink-muted-80">
          Si hay una cuenta con ese correo, te hemos enviado un enlace que caduca en una hora. Si no lo
          ves, revisa la carpeta de spam.
        </p>
      ) : (
        <ForgotPasswordFormContainer />
      )}
    </AuthCard>
  );
}
