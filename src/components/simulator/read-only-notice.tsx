import Link from "next/link";
import { withNext } from "@/lib/auth/next-path";

// Signed out, a shared link only shows its results: changing or saving them
// takes an account, and signing in comes back to the same scenario.
export function ReadOnlyNotice({ next }: { next: string }) {
  return (
    <section aria-labelledby="solo-lectura" className="flex flex-col gap-4 rounded-lg border border-hairline p-6">
      <h2 id="solo-lectura" className="text-tagline">
        Estás viendo un escenario compartido
      </h2>
      <p className="text-body text-pretty text-ink-muted-80">
        Inicia sesión para cambiar los votos, partir de otra elección y guardar tus simulacros en tu perfil.
      </p>
      <div className="flex flex-wrap items-center gap-5">
        <Link
          href={withNext("/login", next)}
          className="flex min-h-11 items-center rounded-full bg-primary px-[22px] text-body text-on-primary transition-[scale,background-color] duration-200 ease-snappy hover:bg-primary-focus active:scale-[0.97]"
        >
          Iniciar sesión
        </Link>
        <Link href={withNext("/register", next)} className="flex min-h-11 items-center text-body text-primary underline">
          Crear cuenta
        </Link>
      </div>
    </section>
  );
}
