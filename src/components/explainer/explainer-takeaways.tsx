import { MAJORITY } from "@/lib/hemicycle-layout";
import { cssVar } from "@/lib/css-var";
import { dhondt } from "@/lib/engine/dhondt";
import { simulationSeats } from "@/lib/elections/current";
import { sectionTitle } from "../home/type";

// Three invented provinces of 3 seats. Partido X has all its votes in the first;
// Partido Y has more votes, spread evenly. The engine decides the seats.
const provinces = [
  [
    { id: "Partido A", votes: 50000 },
    { id: "Partido X", votes: 30000 },
    { id: "Partido Y", votes: 15000 },
  ],
  ...Array.from({ length: 2 }, () => [
    { id: "Partido A", votes: 55000 },
    { id: "Partido B", votes: 30000 },
    { id: "Partido Y", votes: 15000 },
  ]),
];
const awards = provinces.flatMap((candidacies) => dhondt(candidacies, 3, "explainer").awards);
const compared = [
  { id: "Partido X", how: "todos en una provincia" },
  { id: "Partido Y", how: "repartidos entre tres" },
].map(({ id, how }) => ({
  id,
  how,
  votes: provinces.flat().reduce((sum, candidacy) => sum + (candidacy.id === id ? candidacy.votes : 0), 0),
  seats: awards.filter((award) => award.candidacyId === id).length,
}));
const format = (n: number) => n.toLocaleString("es-ES", { useGrouping: "always" });
const seatsLabel = (n: number) => `${n} ${n === 1 ? "escaño" : "escaños"}`;

const takeaways = [
  {
    figure: String(simulationSeats.get("42")),
    unit: "escaños en Soria",
    title: "En las provincias pequeñas, el listón sube.",
    text: "Con solo 2 escaños en juego, un partido necesita mucho más que el 3 % para llevarse uno.",
    depth: 1.5,
  },
  {
    figure: "52",
    unit: "recuentos separados",
    title: "Importa dónde están los votos.",
    text: "Un partido con el voto concentrado en pocas provincias puede sacar más escaños que otro con más voto repartido.",
    depth: 0.5,
    example: true,
  },
  {
    figure: String(MAJORITY),
    unit: "escaños para la mayoría absoluta",
    title: "La cifra que se mira.",
    text: "Es la mitad más uno de los 350 escaños del Congreso.",
    depth: -1,
  },
];

export function ExplainerTakeaways() {
  return (
    <section aria-labelledby="takeaways-title" className="depth-scope focus-on-dark overflow-clip bg-surface-black text-on-dark">
      <div className="mx-auto flex max-w-content flex-col gap-12 px-5 py-section sm:px-8 lg:py-40">
        <h2 id="takeaways-title" className={`max-w-[48rem] ${sectionTitle}`}>
          Por eso un porcentaje no es un número de escaños.
        </h2>
        {/* One row per idea: the numeral is the image, the sentence explains it. */}
        <ul className="flex flex-col">
          {takeaways.map(({ figure, unit, title, text, depth, example }) => (
            <li
              key={title}
              className="grid gap-6 border-t border-on-dark/15 py-10 md:grid-cols-[5fr_7fr] md:items-end md:gap-16 lg:py-14"
            >
              <p style={cssVar("--d", depth)} className="depth flex flex-col gap-3">
                <span className="text-[clamp(6rem,18vw,13rem)] leading-[0.8] font-semibold tracking-[-0.04em] tabular-nums">{figure}</span>
                <span className="text-caption text-on-dark-muted">{unit}</span>
              </p>
              <div className="flex flex-col gap-3">
                <h3 className="text-tagline">{title}</h3>
                <p className="max-w-[30rem] text-body text-pretty text-on-dark-muted">{text}</p>
                {example && (
                  <figure className="mt-3 flex max-w-[30rem] flex-col gap-3">
                    <dl className="flex flex-col">
                      {compared.map(({ id, how, votes, seats }) => (
                        <div key={id} className="flex items-baseline justify-between gap-4 border-b border-on-dark/15 py-2.5">
                          <dt className="text-caption">
                            <span className="font-semibold">{id}</span>
                            <span className="text-on-dark-muted">
                              {" "}
                              · {format(votes)} votos, {how}
                            </span>
                          </dt>
                          <dd className="text-body font-semibold whitespace-nowrap tabular-nums">{seatsLabel(seats)}</dd>
                        </div>
                      ))}
                    </dl>
                    <figcaption className="text-caption text-pretty text-on-dark-muted">
                      Ejemplo con datos inventados: tres provincias de 3 escaños cada una.
                    </figcaption>
                  </figure>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
