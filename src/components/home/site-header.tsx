import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="bg-surface-black text-on-dark">
      <nav
        aria-label="Principal"
        className="mx-auto flex h-11 max-w-content items-center justify-between gap-4 px-5 text-fine-print whitespace-nowrap"
      >
        <Link href="/" className="flex min-h-11 items-center text-fine-print font-semibold xs:text-caption">
          Simulador de Elecciones
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="flex min-h-11 items-center">
            Iniciar sesión
          </Link>
          {/* The link fills the 44px bar for touch; the pill inside stays compact. */}
          <Link href="/register" className="group flex min-h-11 items-center">
            <span className="rounded-full bg-primary px-3 py-1.5 text-on-primary transition-transform group-active:scale-95">
              Crear cuenta
            </span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
