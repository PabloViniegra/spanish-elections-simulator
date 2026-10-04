import { ConstituencyDots } from "./constituency-dots";
import { sectionTitle } from "./type";

export function SeatContrast() {
  return (
    <section aria-labelledby="contrast-title" className="bg-canvas-parchment">
      <div className="mx-auto grid max-w-content gap-12 px-5 py-section sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-32">
        <div className="flex flex-col gap-5">
          <h2 id="contrast-title" className={sectionTitle}>
            En Soria, 2.
            <br />
            En Madrid, 37.
          </h2>
          <p className="max-w-[30rem] text-body text-pretty text-ink-muted-80">
            Cada provincia es una circunscripción con sus propios escaños, y un partido necesita el
            3 % de sus votos para entrar en el reparto.
          </p>
        </div>
        <ConstituencyDots />
      </div>
    </section>
  );
}
