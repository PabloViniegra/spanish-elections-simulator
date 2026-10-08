import { cssVar } from "@/lib/css-var";
import { sectionTitle } from "../home/type";

// LOREG art. 96: what each kind of ballot does in the count.
type PaperKind = "list" | "blank" | "spoilt" | "none";

const ballots: { kind: string; verdict: string; detail: string; paper: PaperKind; tilt: string; depth: number }[] = [
  { kind: "Una candidatura", verdict: "Cuenta", detail: "Suma para su partido y para calcular el 3 %.", paper: "list", tilt: "-rotate-3", depth: 1.5 },
  { kind: "En blanco", verdict: "Cuenta, a medias", detail: "Entra en el cálculo del 3 %, pero no da escaños. Un sobre vacío es un voto en blanco.", paper: "blank", tilt: "rotate-2", depth: -1 },
  { kind: "Nulo", verdict: "No cuenta", detail: "Por ejemplo, una papeleta con nombres tachados o dos papeletas distintas en el sobre.", paper: "spoilt", tilt: "-rotate-1", depth: 2 },
  { kind: "No votar", verdict: "No cuenta", detail: "La abstención solo cambia la participación.", paper: "none", tilt: "rotate-3", depth: -0.5 },
];

// A ballot paper drawn in a few strokes: a printed list, an empty sheet, a
// list struck through, or no paper at all.
function Paper({ paper }: { paper: PaperKind }) {
  if (paper === "none") return <div aria-hidden="true" className="aspect-[3/4] w-full rounded-xs border border-dashed border-ink-muted-48" />;
  return (
    <div aria-hidden="true" className={`relative flex aspect-[3/4] w-full flex-col gap-2 rounded-xs bg-canvas p-4 shadow-product ${paper === "spoilt" ? "opacity-60" : ""}`}>
      {paper !== "blank" && (
        <>
          <span className="h-1.5 w-1/2 rounded-full bg-hairline" />
          <span className="mt-3 flex flex-col gap-1.5">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((line) => (
              <span key={line} className="h-1 rounded-full bg-ink-muted-48" style={{ width: `${90 - (line % 4) * 12}%` }} />
            ))}
          </span>
        </>
      )}
      {paper === "spoilt" && <span className="absolute inset-x-3 top-1/2 h-0.5 -rotate-[30deg] rounded-full bg-ink" />}
    </div>
  );
}

export function BallotCards() {
  return (
    <section aria-labelledby="ballots-title" className="depth-scope focus-on-dark overflow-clip bg-surface-tile-1 text-on-dark">
      <div className="mx-auto flex max-w-content flex-col gap-14 px-5 py-section sm:px-8 lg:py-40">
        <div className="rise-scope flex max-w-[44rem] flex-col gap-5">
          <h2 id="ballots-title" className={`rise [--c:0] ${sectionTitle}`}>
            Qué votos entran en el reparto.
          </h2>
          <p className="rise text-body text-pretty text-on-dark-muted [--c:1]">
            Los votos válidos son los de las candidaturas más los votos en blanco. Con ellos se calcula todo lo demás.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 lg:gap-8">
          {ballots.map(({ kind, verdict, detail, paper, tilt, depth }) => (
            <li key={kind} className="flex flex-col gap-8">
              {/* Only the paper drifts, so the four labels stay on one line. */}
              <div style={cssVar("--d", depth)} className={`depth mx-auto w-full max-w-44 ${tilt}`}>
                <Paper paper={paper} />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-caption text-on-dark-muted">{kind}</p>
                <p className="text-tagline">{verdict}</p>
                <p className="text-caption text-pretty text-on-dark-muted">{detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
