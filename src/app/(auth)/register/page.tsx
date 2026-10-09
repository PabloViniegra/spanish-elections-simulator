import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterFormContainer } from "@/components/auth/register-form-container";
import { SimulatorGate } from "@/components/auth/simulator-gate";
import { leadsToSimulator, safeNextPath, withNext } from "@/lib/auth/next-path";

export const metadata: Metadata = { title: "Crear cuenta" };

type RegisterPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const next = safeNextPath((await searchParams).next);
  return (
    <AuthCard
      title="Crea tu cuenta"
      notice={leadsToSimulator(next) ? <SimulatorGate /> : undefined}
      description="Solo necesitas usuario, correo y contraseña."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link href={withNext("/login", next)} className="text-primary underline">
            Inicia sesión
          </Link>
          <br />
          Consulta cómo tratamos tus datos en la{" "}
          <Link href="/privacy" className="text-primary underline">
            política de privacidad
          </Link>
          .
        </>
      }
    >
      <RegisterFormContainer next={next} />
    </AuthCard>
  );
}
