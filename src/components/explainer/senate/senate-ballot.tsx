import { constituency, marksAllowed } from "@/lib/senate/senate";
import { sectionTitle } from "../../home/type";
import { BallotLive } from "./ballot-live";

const SHOWN_PARTIES = 4;
const soria = constituency("429");
const parties = Map.groupBy(soria.candidates, (candidate) => candidate.party);
const lists = [...parties].slice(0, SHOWN_PARTIES).map(([party, candidates]) => ({ party, names: candidates.map((candidate) => candidate.name) }));
const hidden = parties.size - SHOWN_PARTIES;

export function SenateBallot() {
  return (
    <section aria-labelledby="senate-ballot-title" className="overflow-clip bg-canvas">
      <div className="mx-auto grid max-w-content gap-12 px-5 py-section sm:px-8 lg:grid-cols-[5fr_7fr] lg:items-start lg:gap-16 lg:py-40">
        <div className="rise-scope rise-unmask flex flex-col gap-5 lg:sticky lg:top-24">
          <h2 id="senate-ballot-title" className={`rise [--c:0] ${sectionTitle}`}>
            En la papeleta sepia se vota a personas
          </h2>
          <p className="rise max-w-[30rem] text-body text-pretty text-ink-muted-80 [--c:1]">
            Para el Congreso eliges una lista cerrada. Para el Senado, la papeleta trae los nombres de todos los candidatos y tú
            marcas con una cruz a los que quieres.
          </p>
          <ul className="rise flex max-w-[30rem] flex-col gap-3 text-body text-pretty text-ink-muted-80 [--c:2]">
            <li>
              <strong className="font-semibold text-ink">Como mucho {marksAllowed(soria.seats)}.</strong> En una provincia que
              elige {soria.seats}, puedes marcar {marksAllowed(soria.seats)}. Si marcas más, el voto es nulo. También lo es si escribes en la papeleta o tachas o añades nombres.
            </li>
            <li>
              <strong className="font-semibold text-ink">De uno o de varios partidos.</strong> Puedes mezclar candidatos de
              listas distintas.
            </li>
            <li>
              <strong className="font-semibold text-ink">Menos también vale.</strong> Con una sola cruz el voto es válido.
            </li>
          </ul>
        </div>
        <figure className="flex flex-col gap-4">
          <BallotLive lists={lists} limit={marksAllowed(soria.seats)} />
          <figcaption className="max-w-[34rem] text-caption text-pretty text-ink-muted-80">
            Las {SHOWN_PARTIES} candidaturas más votadas en {soria.name} el 23 de julio de 2023, de más a menos votos; la papeleta real
            traía {hidden} más. En ella, las candidaturas siguen los votos de las anteriores elecciones al Senado y cada partido
            ordena a sus candidatos (LOREG, artículo 172.3). SY es la agrupación de electores Soria ¡Ya!.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
