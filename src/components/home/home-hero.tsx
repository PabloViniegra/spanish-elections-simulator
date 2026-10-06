import { CountReplay } from "./count-replay";
import { CtaLinks } from "./cta-links";
import { SeatCount } from "./seat-count";
import { pageTitle } from "./type";

export function HomeHero({ username }: { username?: string }) {
  return (
    <section aria-labelledby="home-title" className="bg-surface-black text-on-dark">
      <div className="mx-auto flex max-w-content flex-col items-center gap-14 px-5 pt-12 pb-6 lg:min-h-[calc(100svh-2.75rem)] lg:justify-between lg:gap-8 text-center sm:px-8 lg:pt-16">
        <div className="flex flex-col items-center gap-6">
          <h1 id="home-title" className={`hero-rise [--c:0] ${pageTitle}`}>
            350 escaños. <br className="lg:hidden" />
            52 repartos.
          </h1>
          <p className="hero-rise max-w-[34rem] text-body text-on-dark-muted [--c:1] lg:text-lead-airy">
            Las 50 provincias, Ceuta y Melilla reparten cada una sus propios escaños. Pon una
            estimación de voto y mira cómo queda el Congreso en las generales del 29 de noviembre.
          </p>
          <div className="hero-rise [--c:2]">
            <CtaLinks tone="dark" withLogin={!username} />
          </div>
          <p className="hero-rise text-caption text-on-dark-muted [--c:3]">
            Es una simulación, no una previsión.
          </p>
        </div>
        <CountReplay>
          <SeatCount />
        </CountReplay>
      </div>
    </section>
  );
}
