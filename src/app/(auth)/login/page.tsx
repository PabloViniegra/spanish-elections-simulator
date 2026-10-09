import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginFormContainer } from "@/components/auth/login-form-container";
import { SimulatorGate } from "@/components/auth/simulator-gate";
import { leadsToSimulator, safeNextPath, withNext } from "@/lib/auth/next-path";

export const metadata: Metadata = { title: "Iniciar sesión" };

type LoginPageProps = {
  searchParams: Promise<{ verified?: string; reset?: string; error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { verified, reset, error, next: nextParam } = await searchParams;
  const next = safeNextPath(nextParam);
  const gated = leadsToSimulator(next);
  return (
    <AuthCard
      title={gated ? "Inicia sesión para simular" : "Inicia sesión"}
      description="Accede con tu usuario o tu correo electrónico."
      notice={gated ? <SimulatorGate /> : undefined}
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link href={withNext("/register", next)} className="text-primary underline">
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
      {reset && (
        <p role="status" className="mb-5 rounded-sm border border-primary px-4 py-3 text-caption text-primary">
          Contraseña cambiada. Inicia sesión con la nueva.
        </p>
      )}
      {error && (
        <p role="alert" className="mb-5 rounded-sm border border-error px-4 py-3 text-caption text-error">
          El enlace de confirmación no es válido o ha caducado. Inicia sesión para recibir uno nuevo.
        </p>
      )}
      <LoginFormContainer next={next} />
    </AuthCard>
  );
}
