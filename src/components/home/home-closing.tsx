import { CtaLinks } from "./cta-links";
import { sectionTitle } from "./type";

export function HomeClosing() {
  return (
    <>
      <section aria-labelledby="closing-title" className="bg-primary text-on-primary">
        <div className="mx-auto flex max-w-content flex-col gap-6 px-5 py-section sm:px-8 lg:py-32">
          <h2 id="closing-title" className={sectionTitle}>
            Tú pones los porcentajes.
            <br />
            La ley, los escaños.
          </h2>
          <p className="max-w-[34rem] text-body">
            El simulador llega pronto. Crea tu cuenta y te avisamos en cuanto abra.
          </p>
          <CtaLinks tone="blue" />
        </div>
      </section>
      <footer className="bg-surface-black text-on-dark-muted">
        <p className="mx-auto max-w-content px-5 py-6 text-fine-print sm:px-8">
          Escaños de 2023 según el Real Decreto 400/2023. Es una simulación, no una previsión, y no
          favorece a ninguna candidatura.
        </p>
      </footer>
    </>
  );
}
