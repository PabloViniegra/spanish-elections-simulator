import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterFormContainer } from "@/components/auth/register-form-container";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
  return (
    <AuthCard
      title="Crea tu cuenta"
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-primary underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <RegisterFormContainer />
    </AuthCard>
  );
}
