import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordFormContainer } from "@/components/auth/reset-password-form-container";

export const metadata: Metadata = { title: "Cambiar la contraseña" };

type ResetPasswordPageProps = {
  // Better Auth adds `token` when the emailed link is valid, `error` otherwise.
  searchParams: Promise<{ token?: string; error?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token, error } = await searchParams;
  return (
    <AuthCard
      title="Elige una contraseña nueva"
      description="Al cambiarla se cerrará la sesión en todos tus dispositivos."
      footer={
        <>
          ¿La recuerdas?{" "}
          <Link href="/login" className="text-primary underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      {token && !error ? (
        <ResetPasswordFormContainer token={token} />
      ) : (
        <p role="alert" className="text-body text-error">
          El enlace para cambiar la contraseña no es válido o ha caducado.{" "}
          <Link href="/forgot-password" className="underline">
            Pide uno nuevo
          </Link>
          .
        </p>
      )}
    </AuthCard>
  );
}
