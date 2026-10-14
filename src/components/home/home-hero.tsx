import { CountReplay } from "./count-replay";
import { CtaLinks } from "./cta-links";
import { SeatCount } from "./seat-count";
import { pageTitle } from "./type";
import type { ReactNode } from "react";

export function HomeHero({ actions }: { actions?: ReactNode }) {
  return (
    <section aria-labelledby="home-title" className="lift-scope pin-scope focus-on-dark overflow-clip bg-surface-black text-on-dark">
      <div className="pin-stage mx-auto flex max-w-content flex-col items-center gap-14 px-5 pt-12 pb-6 lg:min-h-[calc(100svh-2.75rem)] lg:justify-between lg:gap-8 text-center sm:px-8 lg:pt-16">
        <div className="lift-away pin-copy flex flex-col items-center gap-6">
          <h1 id="home-title" className={`hero-rise [--c:0] ${pageTitle}`}>
            Así se reparte el Congreso
          </h1>
          <p className="hero-rise max-w-[34rem] text-body text-on-dark-muted [--c:1] lg:text-lead-airy">
            Los 350 escaños no se reparten de una vez: cada provincia, Ceuta y Melilla hacen su propio
            reparto. Pon una estimación de voto y mira cómo quedaría.
          </p>
          <div className="hero-rise [--c:2]">
            {actions ?? <CtaLinks tone="dark" size="hero" />}
          </div>
          <p className="hero-rise text-caption text-on-dark-muted [--c:3]">
            Sin cuenta; regístrate solo para guardar.
          </p>
        </div>
        <div className="sink pin-zoom w-full">
          <CountReplay>
            <SeatCount />
          </CountReplay>
        </div>
        <p className="text-caption text-on-dark-muted">Es una simulación, no una previsión.</p>
      </div>
    </section>
  );
}
