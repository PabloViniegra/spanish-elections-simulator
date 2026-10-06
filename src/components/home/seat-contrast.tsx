import { seats2026 } from "@/lib/seats-2026";
import { ConstituencyDots } from "./constituency-dots";
import { sectionTitle } from "./type";

export function SeatContrast() {
  return (
    <section aria-labelledby="contrast-title" className="bg-canvas-parchment">
      <div className="mx-auto grid max-w-content gap-12 px-5 py-section sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-32">
        <div className="rise-scope flex flex-col gap-5">
          <h2 id="contrast-title" className={`rise [--c:0] ${sectionTitle}`}>
            En Soria, 2.
            <br />
            En Madrid, {seats2026.get("28")}.
          </h2>
          <p className="rise max-w-[30rem] text-body [--c:1] text-pretty text-ink-muted-80">
            Cada provincia parte de 2 escaños, y Ceuta y Melilla tienen 1. Los 248 restantes se
            reparten según la población.
          </p>
        </div>
        <ConstituencyDots />
      </div>
    </section>
  );
}
