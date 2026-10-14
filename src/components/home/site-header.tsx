import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/lib/auth/actions";
import { HemicycleGlyph } from "@/components/brand/hemicycle-glyph";
import { MobileMenu } from "./mobile-menu";
import { BAR, NavLink, type NavPage } from "./nav-link";

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
      <NavLink href="/simulator" page="simulator" current={current} variant={variant}>
        Simulador
      </NavLink>
      <NavLink href="/builder/new" page="builder" current={current} variant={variant}>
        Construir
      </NavLink>
      <NavLink href="/how-it-works" page="how-it-works" current={current} variant={variant}>
        Cómo funciona
      </NavLink>
    </>
  );
}

export type Variant = "bar" | "row" | "pill";

const pillClasses =
  "inline-flex items-center gap-1.5 rounded-full bg-action-blue px-[15px] py-2 text-ink transition-[background-color,scale] duration-150 ease-snappy group-hover/cta:bg-action-blue-hover group-active/cta:scale-[0.97]";

function RegisterPill({ className = "min-h-11" }: { className?: string }) {
  return (
    <Link href="/register" className={`group/cta flex items-center ${className}`}>
      <span className={pillClasses}>
        Crear cuenta
        <HemicycleGlyph className="h-2.5 w-4" />
      </span>
    </Link>
  );
}

export function AccountLinks({ username, current, variant }: { username?: string; current: NavPage; variant: Variant }) {
  const bar = variant === "bar";
  const signUpIsThePoint = current !== "simulator";

  if (variant === "pill") return !username && signUpIsThePoint ? <RegisterPill /> : null;

  return username ? (
    <>
      <NavLink href="/profile" page="profile" current={current} variant={bar ? "bar" : "row"}>
        {bar ? <span className="sr-only">Mi perfil: </span> : "Mi perfil · "}
        <span className={bar ? "max-w-40 truncate" : "truncate"} title={username}>{username}</span>
      </NavLink>
      <SignOut className={bar ? `flex items-center ${BAR}` : "flex min-h-12 items-center"} />
    </>
  ) : (
    <>
      <Link href="/login" className={bar ? `flex items-center ${BAR}` : "flex min-h-12 items-center"}>Iniciar sesión</Link>
      {signUpIsThePoint ? (
        <RegisterPill className={bar ? "min-h-11" : "min-h-12"} />
      ) : (
        <Link href="/register" className={bar ? `flex items-center ${BAR}` : "flex min-h-12 items-center"}>Crear cuenta</Link>
      )}
    </>
  );
}

export function SiteHeader({ username, current, accountBar, accountRows, accountPill }: { username?: string; current: NavPage; accountBar?: ReactNode; accountRows?: ReactNode; accountPill?: ReactNode }) {
  return (
    <header className="focus-on-dark relative bg-surface-black text-on-dark">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-5 focus:top-1 focus:z-50 focus:rounded-full focus:bg-on-dark focus:px-4 focus:py-2 focus:text-caption focus:text-ink"
      >
        Saltar al contenido
      </a>
      <nav
        aria-label="Principal"
        className="mx-auto flex h-11 max-w-content items-center justify-between gap-2 px-5 text-caption whitespace-nowrap lg:gap-6"
      >
        <Link href="/" className="group flex min-h-11 shrink-0 items-center gap-2.5 text-body font-semibold">
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
          <span className="sr-only sm:not-sr-only">Simulador de Elecciones</span>
        </Link>
        <div className="ml-6 mr-auto hidden items-center gap-6 lg:flex">
          <Destinations current={current} variant="bar" />
        </div>
        <div className="hidden items-center gap-5 lg:flex">
          {accountBar ?? <AccountLinks username={username} current={current} variant="bar" />}
        </div>
        <div className="flex items-center gap-4 lg:hidden">
          {accountPill ?? <AccountLinks username={username} current={current} variant="pill" />}
          <MobileMenu>
            <Destinations current={current} variant="row" />
            <div className="mt-1 border-t border-white/15 pt-1">
              {accountRows ?? <AccountLinks username={username} current={current} variant="row" />}
            </div>
          </MobileMenu>
        </div>
      </nav>
    </header>
  );
}
