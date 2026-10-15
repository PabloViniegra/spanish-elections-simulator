import congress from "@/data/elections/2023-07.json";
import { cssVar } from "@/lib/css-var";
import { TOTAL_SEATS } from "@/lib/hemicycle-layout";
import { DESIGNATED_SENATORS, ELECTED_SENATORS, TOTAL_SENATORS, senate2023 } from "@/lib/senate/senate";
import { sectionTitle } from "../../home/type";

const congressSeats = (acronym: string) => {
  const ids = new Set(congress.candidacies.filter((candidacy) => candidacy.acronym === acronym).map((candidacy) => candidacy.id));
  return congress.constituencies.flatMap((item) => item.results).reduce((sum, result) => sum + (ids.has(result.candidacyId) ? result.elected : 0), 0);
};
const senateSeats = (party: string) =>
  senate2023.constituencies.flatMap((item) => item.candidates).filter((candidate) => candidate.elected && candidate.party === party).length;
const ppCongress = congressSeats("PP");
const ppSenate = senateSeats("PP");
const voxCongress = congressSeats("VOX");
const voxSenate = senateSeats("VOX");

const chambers = [
  { label: "Congreso", seats: ppCongress, total: TOTAL_SEATS },
  { label: "Senado, escaños electos", seats: ppSenate, total: ELECTED_SENATORS },
];

const percent = (part: number, whole: number) => `${Math.round((part / whole) * 100)} %`;

const consequences = [
  {
    title: `Vox sacó ${voxCongress} diputados y ${voxSenate === 0 ? "ningún senador electo" : `${voxSenate} senadores electos`}`,
    text: "En el Congreso los escaños de cada provincia se reparten en proporción a los votos. En el Senado solo entran los candidatos más votados, y ninguno de Vox lo fue en 2023.",
  },
  {
    title: `La mayoría absoluta está en ${Math.floor(TOTAL_SENATORS / 2) + 1} senadores`,
    text: `Es la mitad más uno de los ${TOTAL_SENATORS}. Los ${ELECTED_SENATORS} electos no bastan para saber quién la tiene: hay que sumar los ${DESIGNATED_SENATORS} designados, que cada parlamento autonómico reparte según su composición.`,
  },
];

export function SenateTakeaways() {
  return (
    <section aria-labelledby="senate-takeaways-title" className="depth-scope focus-on-dark overflow-clip bg-surface-black text-on-dark">
      <div className="mx-auto flex max-w-content flex-col gap-16 px-5 py-section sm:px-8 lg:gap-24 lg:py-40">
        <div className="grid gap-12 lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-16">
          <div className="rise-scope rise-focus flex flex-col gap-5">
            <h2 id="senate-takeaways-title" className={`rise [--c:0] ${sectionTitle}`}>
              Ganar por poco da muchos senadores
            </h2>
            <p className="rise max-w-[30rem] text-body text-pretty text-on-dark-muted [--c:1]">
              Con el 3-1 de cada provincia, ganar por poco en muchas de ellas da muchos más escaños que en el Congreso. En 2023 el PP
              fue el más votado en la mayoría de provincias.
            </p>
          </div>
          <figure style={cssVar("--d", -2)} className="depth flex flex-col gap-4">
            <dl className="reveal-scope flex flex-col">
              {chambers.map(({ label, seats, total }, i) => (
                <div key={label} className="flex flex-col gap-3 border-b border-on-dark/15 py-5 first:border-t">
                  <dt className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <span className="text-tagline">{label}</span>
                    <span className="text-caption text-on-dark-muted tabular-nums">
                      {seats} de {total}
                    </span>
                  </dt>
                  <dd className="flex items-center gap-4">
                    <span aria-hidden="true" className="h-3 flex-1 rounded-full bg-on-dark/15">
                      <span style={{ ...cssVar("--i", i), width: `${(seats / total) * 100}%` }} className="bar-grow block h-full rounded-full bg-on-dark" />
                    </span>
                    <span className="w-14 text-right text-body font-semibold tabular-nums">{percent(seats, total)}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <figcaption className="text-caption text-pretty text-on-dark-muted">
              Escaños del PP en las elecciones del 23 de julio de 2023.
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
