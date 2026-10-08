import { SiteFooter } from "../layout/site-footer";
import { CtaLinks } from "./cta-links";
import { closingTitle } from "./type";

export function HomeClosing() {
  return (
    <>
      <section aria-labelledby="closing-title" className="rise-scope bg-primary text-on-primary [&_:focus-visible]:outline-on-primary">
        <div className="mx-auto flex max-w-content flex-col items-center gap-6 px-5 py-section text-center sm:px-8 lg:py-32">
          <h2 id="closing-title" className={`rise [--c:0] ${closingTitle}`}>
            Tú pones los porcentajes.
            <br />
            La ley, los escaños.
          </h2>
          <p className="rise max-w-[34rem] text-body text-pretty [--c:1]">
            Con los votos oficiales, reproduce uno a uno los escaños de las cuatro últimas generales.
          </p>
          <div className="rise [--c:2]">
            <CtaLinks tone="blue" withLogin={false} />
          </div>
        </div>
      </section>
      <SiteFooter>
        Escaños del 29 de noviembre de 2026 según el Real Decreto 806/2026. Es una simulación, no una previsión, y no favorece a
        ningún partido.
      </SiteFooter>
    </>
  );
}
