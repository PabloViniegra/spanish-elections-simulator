import Link from "next/link";
import { signOut } from "@/lib/auth/actions";
import { MobileMenu } from "./mobile-menu";
import { NavLink, type NavPage } from "./nav-link";

function SignOut({ className }: { className: string }) {
  return (
    <form action={signOut}>
      <button type="submit" className={className}>
        Cerrar sesión
      </button>
    </form>
  );
}

function Destinations({ current, variant }: { current: NavPage; variant: "bar" | "row" }) {
  return (
    <>
      <NavLink href="/simulador" page="simulador" current={current} variant={variant}>
        Simulador
      </NavLink>
      <NavLink href="/como-funciona" page="como-funciona" current={current} variant={variant}>
        Cómo funciona
      </NavLink>
    </>
  );
}

// `current` marks the page in the nav. The sign-up pill is the loudest thing
// on the bar, so it only appears where signing up is the point (home and
// explainer); inside the simulator it drops to a plain link.
export function SiteHeader({ username, current }: { username?: string; current: NavPage }) {
  const pill = current !== "simulador";
  return (
    <header className="relative bg-surface-black text-on-dark [&_:focus-visible]:outline-primary-on-dark">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-5 focus:top-1 focus:z-50 focus:rounded-full focus:bg-on-dark focus:px-4 focus:py-2 focus:text-caption focus:text-ink"
      >
        Saltar al contenido
      </a>
      <nav
        aria-label="Principal"
        className="mx-auto flex h-11 max-w-content items-center justify-between gap-6 px-5 text-caption whitespace-nowrap"
      >
        <Link href="/" className="group flex min-h-11 shrink-0 items-center gap-2.5 text-body font-semibold">
          {/* The app icon's two arcs on one path: hover or focus swings the majority. */}
          <svg viewBox="3 9 26 16" aria-hidden="true" className="h-5 w-8 shrink-0 fill-none stroke-[6]">
            <path
              d="M6 22.5A10 10 0 0 1 26 22.5"
              pathLength="100"
              className="stroke-on-dark transition-[stroke-dasharray] duration-500 ease-snappy [stroke-dasharray:0_55_45_100] group-hover:[stroke-dasharray:0_65_35_100] group-focus-visible:[stroke-dasharray:0_65_35_100] motion-reduce:duration-0"
            />
            <path
              d="M6 22.5A10 10 0 0 1 26 22.5"
              pathLength="100"
              className="stroke-primary-on-dark transition-[stroke-dasharray] duration-500 ease-snappy [stroke-dasharray:52_100] group-hover:[stroke-dasharray:62_100] group-focus-visible:[stroke-dasharray:62_100] motion-reduce:duration-0"
            />
          </svg>
          Simulador de Elecciones
        </Link>
        <div className="ml-6 mr-auto hidden items-center gap-6 sm:flex">
          <Destinations current={current} variant="bar" />
        </div>
        <div className="hidden items-center gap-5 sm:flex">
          {username ? (
            <>
              <span className="max-w-40 truncate text-on-dark-muted" title={username}>
                {username}
              </span>
              <SignOut className="flex min-h-11 items-center" />
            </>
          ) : (
            <>
              <Link href="/login" className="flex min-h-11 items-center">
                Iniciar sesión
              </Link>
              <Link href="/register" className="group flex min-h-11 items-center">
                <span
                  className={
                    pill
                      ? "rounded-full bg-primary px-[15px] py-2 text-on-primary transition-transform duration-150 ease-snappy group-active:scale-[0.97]"
                      : undefined
                  }
                >
                  Crear cuenta
                </span>
              </Link>
            </>
          )}
        </div>
        <MobileMenu>
          <Destinations current={current} variant="row" />
          <div className="mt-1 border-t border-white/15 pt-1">
            {username ? (
              <>
                <p className="flex min-h-12 items-center truncate text-on-dark-muted">{username}</p>
                <SignOut className="flex min-h-12 items-center" />
              </>
            ) : (
              <>
                <Link href="/login" className="flex min-h-12 items-center">
                  Iniciar sesión
                </Link>
                <Link href="/register" className="flex min-h-12 items-center text-primary-on-dark">
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </MobileMenu>
      </nav>
    </header>
  );
}
