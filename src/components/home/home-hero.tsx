import { CountReplay } from "./count-replay";
import { CtaLinks } from "./cta-links";
import { SeatCount } from "./seat-count";
import { pageTitle } from "./type";

export function HomeHero() {
  return (
    <section aria-labelledby="home-title" className="bg-surface-black text-on-dark">
      <div className="mx-auto flex max-w-content flex-col items-center gap-14 px-5 pt-12 pb-10 lg:min-h-[calc(100svh-2.75rem)] lg:justify-between lg:gap-8 text-center sm:px-8 lg:pt-16">
        <div className="flex flex-col items-center gap-6">
          <h1 id="home-title" className={pageTitle}>
            350 escaños. <br className="lg:hidden" />
            52 repartos.
          </h1>
          <p className="max-w-[34rem] text-body text-on-dark-muted lg:text-lead-airy">
            Pon una estimación de voto y mira cómo se reparte el Congreso, provincia a provincia.
          </p>
          <CtaLinks tone="dark" />
          <p className="text-caption text-pretty text-on-dark-muted">
            Llega pronto: crea tu cuenta y te avisamos.
          </p>
        </div>
        <CountReplay>
          <SeatCount />
        </CountReplay>
      </div>
    </section>
  );
}
