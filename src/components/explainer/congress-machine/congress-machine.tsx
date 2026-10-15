import "@/components/iso/iso.css";
import { sectionTitle } from "../../home/type";
import { MachineLive } from "./machine-live";
import { PROVINCES } from "./model";
import { FLANK_ROWS, MAIN_ROWS } from "./seats";

const THEME =
  "[--anatomy-card:var(--color-canvas-parchment)] [--anatomy-paper:var(--color-canvas-parchment)] [--anatomy-hi:var(--color-ink)] [--anatomy-lit:var(--color-ink)] [--anatomy-dot:var(--color-ink-muted-80)]";

export function CongressMachine() {
  return (
    <section aria-labelledby="congress-machine-title" className="depth-scope overflow-clip bg-canvas">
      <div className="mx-auto flex max-w-content flex-col gap-12 px-5 py-section sm:px-8 lg:py-40">
        <div className="rise-scope rise-unmask flex max-w-[46rem] flex-col gap-5">
          <h2 id="congress-machine-title" className={`rise [--c:0] ${sectionTitle}`}>
            La máquina que llena el Congreso
          </h2>
          <p className="rise text-body text-pretty text-ink-muted-80 [--c:1]">
            Cada columna mide el porcentaje de voto válido de una candidatura en la provincia. Sus muescas marcan ese voto
            dividido entre 2, 3, 4… Una barra baja desde arriba y, cada vez que toca una muesca o la parte de arriba de una
            columna, esa candidatura gana un escaño. La barra para cuando la provincia ha repartido todos los suyos.
          </p>
          <p className="rise text-caption text-pretty text-ink-muted-80 [--c:2]">
            Elige una provincia o recorre el reparto paso a paso con las flechas del teclado.
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
