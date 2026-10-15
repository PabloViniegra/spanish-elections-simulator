import { DESIGNATED_SENATORS, ELECTED_SENATORS, TOTAL_SENATORS } from "@/lib/senate/senate";
import { pageTitle } from "../../home/type";
import { SenateChamber } from "./senate-chamber";

const legend = [
  { filled: true, label: "Elegidos en las urnas, normalmente el mismo día que el Congreso" },
  { filled: false, label: "Designados por los parlamentos autonómicos" },
];

export function SenateHero() {
  return (
    <section aria-labelledby="senate-title" className="lift-scope focus-on-dark overflow-clip bg-surface-black text-on-dark">
      <div className="mx-auto flex max-w-content flex-col items-center gap-12 px-5 pt-14 pb-16 text-center sm:px-8 lg:min-h-[calc(100svh-2.75rem)] lg:justify-between lg:pt-20">
        <div className="lift-away flex flex-col items-center gap-6">
          <h1 id="senate-title" className={`hero-rise [--c:0] ${pageTitle}`}>
            Cómo se llenan los escaños del Senado
          </h1>
          <p className="hero-rise max-w-[34rem] text-body text-pretty text-on-dark-muted [--c:1] lg:text-lead-airy">
            El Senado tiene {TOTAL_SENATORS} senadores: {ELECTED_SENATORS} se votan en las generales y {DESIGNATED_SENATORS} los
            nombran los parlamentos autonómicos.
          </p>
        </div>
        <figure className="sink flex w-full max-w-[min(60rem,max(18rem,calc((100svh-36rem)*2)))] flex-col items-center gap-6">
          <SenateChamber />
          <figcaption>
            <ul className="flex flex-col items-center gap-2 text-left text-caption text-pretty text-on-dark-muted sm:flex-row sm:justify-center sm:gap-6">
              {legend.map(({ filled, label }) => (
                <li key={label} className="flex items-start gap-2">
                  <span aria-hidden="true" className={`mt-1.5 size-2.5 shrink-0 rounded-full ${filled ? "bg-on-dark" : "border border-on-dark/70"}`} />
                  {label}
                </li>
              ))}
            </ul>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
