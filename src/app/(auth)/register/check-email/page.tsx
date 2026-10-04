import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = { title: "Revisa tu correo" };

type CheckEmailPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function CheckEmailPage({ searchParams }: CheckEmailPageProps) {
  const { email } = await searchParams;
  return (
    <AuthCard
      title="Revisa tu correo"
      description={
        email
          ? `Hemos enviado un enlace de confirmación a ${email}.`
          : "Hemos enviado un enlace de confirmación a tu correo."
      }
      footer={
        <>
          ¿Ya lo has confirmado?{" "}
          <Link href="/login" className="text-primary underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <p className="text-body text-ink-muted-80">
        Abre el enlace para activar tu cuenta. Si no lo ves, revisa la carpeta de spam; si intentas
        iniciar sesión sin confirmar, te lo reenviaremos.
      </p>
    </AuthCard>
  );
}
