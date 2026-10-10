import Link from "next/link";
import { withNext } from "@/lib/auth/next-path";

export function SaveAccountNotice({ next }: { next: string }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-body text-pretty text-ink-muted-80">
        Puedes simular, compartir y descargar sin cuenta. Para guardar este escenario en tu perfil, crea una cuenta gratuita o inicia sesión.
      </p>
      <div className="flex flex-wrap items-center gap-5">
        <Link href={withNext("/register", next)} className="inline-flex min-h-11 items-center text-primary underline">
          Crear cuenta para guardar
        </Link>
        <Link href={withNext("/login", next)} className="inline-flex min-h-11 items-center text-primary underline">
          Iniciar sesión
        </Link>
      </div>
    </div>
  );
}
