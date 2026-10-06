import { CtaLinks } from "./cta-links";
import { closingTitle } from "./type";

export function HomeClosing({ signedIn }: { signedIn?: boolean }) {
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
            Abre antes del 29 de noviembre y te escribimos en cuanto esté listo.
          </p>
          {!signedIn && (
            <div className="rise [--c:2]">
              <CtaLinks tone="blue" withLogin={false} />
            </div>
          )}
        </div>
      </section>
      <footer className="bg-surface-black text-on-dark-muted">
        <div className="mx-auto max-w-content px-5 py-6 sm:px-8">
          <p className="max-w-prose text-fine-print">
            Escaños del 29 de noviembre de 2026 según el Real Decreto 806/2026. Es una simulación,
            no una previsión, y no favorece a ningún partido.
          </p>
        </div>
      </footer>
    </>
  );
}
