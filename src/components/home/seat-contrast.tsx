import { cssVar } from "@/lib/css-var";
import { simulationSeats } from "@/lib/elections/current";
import { ElectionReference } from "../legal/election-reference";
import { ConstituencyDots } from "./constituency-dots";
import { sectionTitle } from "./type";

export function SeatContrast() {
  return (
    <section aria-labelledby="contrast-title" className="depth-scope overflow-clip bg-canvas-parchment">
      <div className="mx-auto grid max-w-content gap-12 px-5 py-section sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-32">
        <div style={cssVar("--d", 1.5)} className="depth rise-scope rise-side flex flex-col gap-5">
          <h2 id="contrast-title" className={`rise [--c:0] ${sectionTitle}`}>
            Soria elige <span className="text-[1.3em] tracking-[-0.04em]">2</span>
            <br />
            y Madrid, <span className="text-[1.3em] tracking-[-0.04em]">{simulationSeats.get("28")}</span>
          </h2>
          <p className="rise max-w-[30rem] text-body [--c:1] text-pretty text-ink-muted-80">
            Cada provincia parte de 2 escaños, y Ceuta y Melilla tienen 1. Los 248 restantes se
            reparten según la población de derecho (padrón) de cada provincia.
          </p>
          <p className="rise max-w-[30rem] text-caption text-pretty text-ink-muted-80 [--c:2]">
            <ElectionReference />
          </p>
        </div>
        <div style={cssVar("--d", -2)} className="depth">
          <div className="zoom-in">
            <ConstituencyDots />
          </div>
        </div>
      </div>
    </section>
  );
}
