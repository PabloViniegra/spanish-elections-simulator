import { MAJORITY } from "@/lib/hemicycle-layout";
import { cssVar } from "@/lib/css-var";
import { dhondt } from "@/lib/engine/dhondt";
import { sectionTitle } from "../home/type";

// Three invented provinces of 3 seats; the engine decides the seats.
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

const consequences = [
  {
    title: "En las provincias pequeñas el listón real es más alto",
    text: "Con 2 o 3 escaños en juego, superar el 3 % no basta: hace falta bastante más voto para llevarse uno.",
  },
  {
    title: `La mayoría absoluta está en ${MAJORITY} escaños`,
    text: "Es la mitad más uno de los 350. Hace falta en la primera votación de investidura; en la segunda basta con más síes que noes.",
  },
];

export function ExplainerTakeaways() {
  return (
    <section aria-labelledby="takeaways-title" className="depth-scope focus-on-dark overflow-clip bg-surface-black text-on-dark">
      <div className="mx-auto flex max-w-content flex-col gap-16 px-5 py-section sm:px-8 lg:gap-24 lg:py-40">
        <div className="grid gap-12 lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-16">
          <div className="rise-scope rise-focus flex flex-col gap-5">
            <h2 id="takeaways-title" className={`rise [--c:0] ${sectionTitle}`}>
              Por qué más votos no siempre dan más escaños
            </h2>
            <p className="rise max-w-[30rem] text-body text-pretty text-on-dark-muted [--c:1]">
              Importa dónde se concentran los votos. Un partido fuerte en pocas provincias puede sacar más escaños que otro con más
              voto repartido.
            </p>
          </div>
          <figure style={cssVar("--d", -2)} className="depth flex flex-col gap-4">
            <dl className="reveal-scope flex flex-col">
              {compared.map(({ id, how, votes, seats }) => (
                <div key={id} className="flex flex-col gap-3 border-b border-on-dark/15 py-5 first:border-t">
                  <dt className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <span className="text-tagline">{id}</span>
                    <span className="text-caption text-on-dark-muted">
                      {format(votes)} votos, {how}
                    </span>
                  </dt>
                  <dd className="flex items-center gap-3">
                    <span aria-hidden="true" className="flex gap-1.5">
                      {seats === 0 ? (
                        <span className="size-4 rounded-full border border-dashed border-on-dark/50" />
                      ) : (
                        Array.from({ length: seats }, (_, i) => (
                          <span key={i} style={cssVar("--i", i * 8)} className="reveal-dot size-4 rounded-full bg-on-dark" />
                        ))
                      )}
                    </span>
                    <span className="text-body font-semibold tabular-nums">{seatsLabel(seats)}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <figcaption className="text-caption text-pretty text-on-dark-muted">
              Ejemplo con datos inventados: tres provincias de 3 escaños cada una.
            </figcaption>
          </figure>
        </div>
        <ul className="rise-scope rise-side grid gap-10 md:grid-cols-2 md:gap-16">
          {consequences.map(({ title, text }, i) => (
            <li key={title} style={cssVar("--c", i)} className="rise flex flex-col gap-3 border-t border-on-dark/15 pt-6">
              <h3 className="text-tagline text-balance">{title}</h3>
              <p className="max-w-[30rem] text-body text-pretty text-on-dark-muted">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
