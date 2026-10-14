import { dhondt } from "@/lib/engine/dhondt";
import { DhondtRounds } from "./dhondt-rounds";
import { sectionTitle } from "../home/type";

const blocs = [
  { id: "a", name: "Partido A", votes: 40000 },
  { id: "b", name: "Partido B", votes: 30000 },
  { id: "c", name: "Partido C", votes: 20000 },
];
const SEATS = 5;
const { awards } = dhondt(blocs, SEATS, "explainer");
const rounds = awards.map((award, index) => ({
  seat: index + 1,
  winner: award.candidacyId,
  figures: blocs.map((bloc) => {
    const divisor = 1 + awards.slice(0, index).filter((previous) => previous.candidacyId === bloc.id).length;
    return { id: bloc.id, votes: bloc.votes, divisor, quotient: bloc.votes / divisor };
  }),
}));
const results = blocs.map((bloc) => ({
  ...bloc,
  seats: awards.filter((award) => award.candidacyId === bloc.id).length,
}));

export function DhondtAuction() {
  return (
    <section aria-labelledby="auction-title" className="depth-scope overflow-clip bg-canvas">
      <div className="mx-auto grid max-w-content gap-12 px-5 py-section sm:px-8 lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-16 lg:py-40">
        <div className="rise-scope rise-unmask flex flex-col gap-5">
          <h2 id="auction-title" className={`rise [--c:0] ${sectionTitle}`}>
            D’Hondt reparte los escaños de uno en uno
          </h2>
          <p className="rise max-w-[30rem] text-body text-pretty text-ink-muted-80 [--c:1]">
            Solo compiten los partidos que alcanzan el 3 % de los votos válidos en la provincia. En cada turno pasa
            esto:
          </p>
          <ol className="rise flex max-w-[30rem] flex-col gap-4 text-body text-ink-muted-80 [--c:2]">
            <li><strong className="font-semibold text-ink">1. Compara.</strong> Al principio, cada partido compite con todos sus votos. La cifra más alta gana un escaño.</li>
            <li><strong className="font-semibold text-ink">2. Actualiza solo al ganador.</strong> Para el siguiente turno, divide sus votos originales entre los escaños que ya tiene más uno. Los demás mantienen su cifra.</li>
            <li><strong className="font-semibold text-ink">3. Repite.</strong> Vuelve a comparar las cifras hasta repartir todos los escaños.</li>
          </ol>
          <p className="rise max-w-[30rem] text-caption text-pretty text-ink-muted-80 [--c:3]">
            Con 0 escaños: votos ÷ 1. Con 1: votos ÷ 2. Con 2: votos ÷ 3. Siempre los votos originales, no el resultado anterior.
          </p>
        </div>
        <DhondtRounds rounds={rounds} results={results} />
      </div>
    </section>
  );
}
