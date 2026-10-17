import "@/components/iso/iso.css";
import { sectionTitle } from "../../home/type";
import { MachineLive } from "./machine-live";
import { PROVINCES } from "./model";
import { FLANK_ROWS, MAIN_ROWS } from "./seats";

const THEME =
  "[--anatomy-card:var(--color-canvas-parchment)] [--anatomy-paper:var(--color-canvas-parchment)] [--anatomy-hi:var(--color-ink)] [--anatomy-lit:var(--color-ink)] [--anatomy-dot:var(--color-ink-muted-80)]";

export function CongressMachine() {
  // Its ~2,400 SVG nodes are two-thirds of the page: skip their style and layout until they near the viewport.
  // The intrinsic sizes are the section's measured heights, so the page does not jump when they render.
  return (
    <section aria-labelledby="congress-machine-title" className="depth-scope overflow-clip bg-canvas [content-visibility:auto] [contain-intrinsic-size:auto_1265px] lg:[contain-intrinsic-size:auto_1526px]">
      <div className="mx-auto flex max-w-content flex-col gap-12 px-5 py-section sm:px-8 lg:py-40">
        <div className="rise-scope rise-focus flex max-w-[46rem] flex-col gap-5">
          <h2 id="congress-machine-title" className={`rise [--c:0] ${sectionTitle}`}>
            La máquina que llena el Congreso
          </h2>
          <p className="rise text-body text-pretty text-ink-muted-80 [--c:1]">
            Cada columna es el voto válido de una candidatura en la provincia, y sus muescas marcan ese voto dividido entre
            2, 3, 4… La barra baja desde arriba y cada muesca o columna que toca es un escaño para esa candidatura. Se
            detiene cuando se han repartido todos.
          </p>
          <p className="rise text-caption text-pretty text-ink-muted-80 [--c:2]">
            Elige una provincia o recorre el reparto con las flechas del teclado.
          </p>
        </div>
        <figure className="flex flex-col gap-5">
          <div className="iso" data-theme="light">
            <div className={THEME}>
              <MachineLive seats={{ main: MAIN_ROWS, flank: FLANK_ROWS }} provinces={PROVINCES} initial="28" />
            </div>
          </div>
          <figcaption className="max-w-[46rem] text-caption text-pretty text-ink-muted-80">
            Resultados oficiales de las elecciones del 23 de julio de 2023. El tope de la regla marca el 3 %: una candidatura que
            no llega se queda fuera del reparto en esa provincia. En el hemiciclo los escaños se agrupan por provincia, no por
            grupo parlamentario como en el Congreso de verdad.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
