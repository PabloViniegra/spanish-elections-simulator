import { marksAllowed, seatSplit, senate2023 } from "@/lib/senate/senate";
import { sectionTitle } from "../../home/type";

const LABELS: [number, string][] = [
  [4, "Provincias"],
  [3, "Gran Canaria, Mallorca y Tenerife"],
  [2, "Ceuta y Melilla"],
  [1, "Resto de islas"],
];
const kinds = LABELS.map(([seats, label]) => {
  const members = senate2023.constituencies.filter((item) => item.seats === seats);
  return { label, count: members.length, seats, marks: marksAllowed(seats), sweeps: members.filter((item) => seatSplit(item).length === 1).length };
});

const cities = kinds[2];

export function SenateSpecialCases() {
  return (
    <section aria-labelledby="senate-cases-title" className="focus-on-dark overflow-clip bg-surface-tile-1 text-on-dark">
      <div className="mx-auto grid max-w-content gap-12 px-5 py-section sm:px-8 lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-16 lg:py-40">
        <div className="rise-scope rise-side flex flex-col gap-5">
          <h2 id="senate-cases-title" className={`rise [--c:0] ${sectionTitle}`}>
            Una cruz menos que escaños
          </h2>
          <p className="rise max-w-[30rem] text-body text-pretty text-on-dark-muted [--c:1]">
            Casi siempre puedes marcar menos nombres de los escaños que hay. Así, aunque un partido gane con claridad, sus votantes
            no pueden llevárselo todo y el último escaño suele ir al segundo partido.
          </p>
          <p className="rise max-w-[30rem] text-caption text-pretty text-on-dark-muted [--c:2]">
            En Ceuta y Melilla se eligen 2 senadores y se pueden marcar 2, así que un partido puede ganar los dos. En 2023 pasó en{" "}
            {cities.sweeps === cities.count ? "las dos" : cities.sweeps}. En las islas que eligen 1, gana el candidato más votado.
          </p>
        </div>
        <table className="w-full border-collapse text-left">
          <caption className="caption-bottom pt-4 text-left text-caption text-pretty text-on-dark-muted">
            Ley Orgánica del Régimen Electoral General, artículos 165 y 166.
          </caption>
          <thead>
            <tr className="border-b border-on-dark/15 text-caption text-on-dark-muted">
              <th scope="col" className="py-3 pr-4 font-normal">Circunscripción</th>
              <th scope="col" className="py-3 pr-4 text-right font-normal">Senadores</th>
              <th scope="col" className="py-3 text-right font-normal">Cruces</th>
            </tr>
          </thead>
          <tbody>
            {kinds.map(({ label, count, seats, marks }) => (
              <tr key={label} className="border-b border-on-dark/15">
                <th scope="row" className="py-4 pr-4 align-top font-normal">
                  <span className="block text-body">{label}</span>
                  <span className="block text-caption text-on-dark-muted">{count} circunscripciones</span>
                </th>
                <td className="py-4 pr-4 text-right align-top text-tagline font-semibold tabular-nums">{seats}</td>
                <td className="py-4 text-right align-top">
                  <span className="block text-tagline font-semibold tabular-nums">{marks}</span>
                  <span aria-hidden="true" className="mt-2 flex justify-end gap-1">
                    {Array.from({ length: seats }, (_, i) => (
                      <span key={i} className={`size-2.5 rounded-full ${i < marks ? "bg-on-dark" : "border border-on-dark/60"}`} />
                    ))}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
