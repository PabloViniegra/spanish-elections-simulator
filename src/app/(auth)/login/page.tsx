import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginFormContainer } from "@/components/auth/login-form-container";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
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
      <LoginFormContainer />
    </AuthCard>
  );
}
