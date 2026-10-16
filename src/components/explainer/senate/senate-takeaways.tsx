import congress from "@/data/elections/2023-07.json";
import { cssVar } from "@/lib/css-var";
import { TOTAL_SEATS } from "@/lib/hemicycle-layout";
import { DESIGNATED_SENATORS, ELECTED_SENATORS, TOTAL_SENATORS, senate2023 } from "@/lib/senate/senate";
import { sectionTitle } from "../../home/type";

const congressTotal = (acronym: string, field: "votes" | "elected") => {
  const ids = new Set(congress.candidacies.filter((candidacy) => candidacy.acronym === acronym).map((candidacy) => candidacy.id));
  return congress.constituencies.flatMap((item) => item.results).reduce((sum, result) => sum + (ids.has(result.candidacyId) ? result[field] : 0), 0);
};
const congressSeats = (acronym: string) => congressTotal(acronym, "elected");
const validVotes = congress.constituencies.reduce((sum, item) => sum + item.blankVotes + item.results.reduce((acc, result) => acc + result.votes, 0), 0);
const senateSeats = (party: string) =>
  senate2023.constituencies.flatMap((item) => item.candidates).filter((candidate) => candidate.elected && candidate.party === party).length;
const ppCongress = congressSeats("PP");
const ppSenate = senateSeats("PP");
const voxCongress = congressSeats("VOX");
const voxSenate = senateSeats("VOX");
const fourSeat = senate2023.constituencies.filter((item) => item.seats === 4);
const ppFirst = fourSeat.filter((item) => item.candidates[0]?.party === "PP").length;

const percent = (part: number, whole: number) => `${Math.round((part / whole) * 100)} %`;

const rows = [
  { label: "Votos al Congreso", detail: "de los votos válidos", part: congressTotal("PP", "votes"), total: validVotes },
  { label: "Escaños en el Congreso", detail: `${ppCongress} de ${TOTAL_SEATS}`, part: ppCongress, total: TOTAL_SEATS },
  { label: "Senadores electos", detail: `${ppSenate} de ${ELECTED_SENATORS}`, part: ppSenate, total: ELECTED_SENATORS },
];

const consequences = [
  {
    title: "Quedar tercero en una provincia casi nunca da un senador",
    text: `En el Congreso los escaños de cada provincia se reparten en proporción a los votos. En el Senado solo entran los candidatos más votados: en 2023 Vox sacó ${voxCongress} diputados y ${voxSenate === 0 ? "ningún senador electo" : `${voxSenate} senadores electos`}.`,
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
        <div className="grid gap-12 lg:grid-cols-[7fr_5fr] lg:items-center lg:gap-16">
          <div className="rise-scope rise-focus flex flex-col gap-5">
            <h2 id="senate-takeaways-title" className={`rise [--c:0] ${sectionTitle}`}>
              El más votado de cada provincia suele llevarse 3 de sus 4 senadores
            </h2>
            <p className="rise max-w-[30rem] text-body text-pretty text-on-dark-muted [--c:1]">
              Salvo un empate muy ajustado, da igual que gane por mucho o por poco: el premio es para el partido más votado, sea cual sea. Sumado provincia a
              provincia, su parte del Senado crece muy por encima de su parte de los votos. En 2023 el más votado fue el PP en{" "}
              {ppFirst} de las {fourSeat.length} provincias.
            </p>
          </div>
          <figure style={cssVar("--d", -2)} className="depth flex flex-col gap-4 lg:order-first">
            <dl className="reveal-scope flex flex-col">
              {rows.map(({ label, detail, part, total }, i) => (
                <div key={label} className="flex flex-col gap-3 border-b border-on-dark/15 py-5 first:border-t">
                  <dt className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <span className="text-tagline">{label}</span>
                    <span className="text-caption text-on-dark-muted tabular-nums">
                      {detail}
                    </span>
                  </dt>
                  <dd className="flex items-center gap-4">
                    <span aria-hidden="true" className="h-3 flex-1 rounded-full bg-on-dark/15">
                      <span style={{ ...cssVar("--i", i), width: `${(part / total) * 100}%` }} className="bar-grow block h-full rounded-full bg-on-dark" />
                    </span>
                    <span className="w-14 text-right text-body font-semibold tabular-nums">{percent(part, total)}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <figcaption className="text-caption text-pretty text-on-dark-muted">
              Votos y escaños del PP en las elecciones del 23 de julio de 2023 (Ministerio del Interior).
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
