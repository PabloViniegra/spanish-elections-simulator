import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginFormContainer } from "@/components/auth/login-form-container";

export const metadata: Metadata = { title: "Iniciar sesión" };

type LoginPageProps = {
  searchParams: Promise<{ verified?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { verified, error } = await searchParams;
  return (
    <AuthCard
      title="Inicia sesión"
      description="Accede con tu usuario o tu correo electrónico."
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-primary underline">
            Crea una
          </Link>
        </>
      }
    >
      {verified && (
        <p role="status" className="mb-5 rounded-sm border border-primary px-4 py-3 text-caption text-primary">
          Correo confirmado. Ya puedes iniciar sesión.
        </p>
      )}
      {error && (
        <p role="alert" className="mb-5 rounded-sm border border-error px-4 py-3 text-caption text-error">
          El enlace de confirmación no es válido o ha caducado. Inicia sesión para recibir uno nuevo.
        </p>
      )}
      <LoginFormContainer />
    </AuthCard>
  );
}
