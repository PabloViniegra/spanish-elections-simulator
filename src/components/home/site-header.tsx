import Link from "next/link";
import { signOut } from "@/lib/auth/actions";

// On the explainer the link marks the current page and the pill leads to the
// simulator, the goal of that page, instead of competing with it.
export function SiteHeader({ username, explainer = false }: { username?: string; explainer?: boolean }) {
  return (
    <header className="bg-surface-black text-on-dark">
      <nav
        aria-label="Principal"
        className="mx-auto flex h-11 max-w-content items-center justify-between gap-4 px-5 text-fine-print whitespace-nowrap"
      >
        <Link href="/" className="flex min-h-11 shrink-0 items-center text-fine-print font-semibold xs:text-caption">
          Simulador de Elecciones
        </Link>
        <Link
          href="/como-funciona"
          aria-current={explainer ? "page" : undefined}
          className="ml-auto hidden min-h-11 items-center aria-[current=page]:font-semibold sm:flex"
        >
          Cómo funciona
        </Link>
        {username ? (
          <div className="flex min-w-0 items-center gap-4">
            <span className="truncate" title={username}>
              {username}
            </span>
            <form action={signOut}>
              <button type="submit" className="flex min-h-11 items-center">
                Cerrar sesión
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {/* Below xs the hero right underneath already offers sign-in. */}
            <Link href="/login" className="hidden min-h-11 items-center xs:flex">
              Iniciar sesión
            </Link>
            {/* The link fills the 44px bar for touch; the pill inside stays compact. */}
            <Link href={explainer ? "/simulador" : "/register"} className="group flex min-h-11 items-center">
              <span className="rounded-full bg-primary px-[15px] py-2 text-caption text-on-primary transition-transform duration-150 ease-snappy group-active:scale-[0.97]">
                {explainer ? "Abrir el simulador" : "Crear cuenta"}
              </span>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
