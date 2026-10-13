import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginFormContainer } from "@/components/auth/login-form-container";
import { SimulatorGate } from "@/components/auth/simulator-gate";
import { FlashToast } from "@/components/feedback/flash-toast";
import { Notice } from "@/components/feedback/notice";
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
      {verified && <FlashToast param="verified" title="Correo confirmado" description="Ya puedes iniciar sesión." />}
      {reset && <FlashToast param="reset" title="Contraseña cambiada" description="Inicia sesión con la nueva." />}
      {error && (
        <Notice tone="error" role="alert" className="mb-5">
          El enlace de confirmación no es válido o ha caducado. Inicia sesión para recibir uno nuevo.
        </Notice>
      )}
      <LoginFormContainer next={next} />
    </AuthCard>
  );
}
