import { partySeats, seatSplit, senate2023 } from "@/lib/senate/senate";
import { sectionTitle } from "../../home/type";
import { type RecountConstituency, RecountLive } from "./recount-live";

const constituencies: RecountConstituency[] = senate2023.constituencies
  .map((item) => {
    const { code, name, seats, candidates } = item;
    const shown = seats * 2 + 2;
    const split = partySeats(item).map(([party, won]) => `${won} ${party}`).join(" · ");
    return { code, name, seats, split, candidates: candidates.slice(0, shown), more: Math.max(0, candidates.length - shown) };
  })
  .sort((a, b) => a.name.localeCompare(b.name, "es"));

const fourSeat = senate2023.constituencies.filter((item) => item.seats === 4);
const threeOne = fourSeat.filter((item) => seatSplit(item).join("-") === "3-1").length;
const evenSplits = fourSeat.filter((item) => seatSplit(item).join("-") === "2-2").map(({ code, name }) => ({ code, name }));

export function SenateRecount() {
  return (
    <section aria-labelledby="senate-recount-title" className="overflow-clip bg-canvas-parchment">
      <div className="mx-auto flex max-w-content flex-col gap-12 px-5 py-section sm:px-8 lg:py-40">
        <div className="rise-scope rise-focus grid gap-5 lg:grid-cols-[5fr_7fr] lg:items-end lg:gap-16">
          <h2 id="senate-recount-title" className={`rise [--c:0] ${sectionTitle}`}>
            Ganan los más votados, sin D’Hondt
          </h2>
          <div className="flex flex-col gap-5">
            <p className="rise max-w-[34rem] text-body text-pretty text-ink-muted-80 [--c:1]">
              Cada candidato suma las cruces que ha recibido. Se ordenan de más a menos votos y, en una provincia, los 4 primeros son senadores. No
              hay listón del 3 % ni reparto proporcional.
            </p>
            <p className="rise max-w-[34rem] text-caption text-pretty text-ink-muted-80 [--c:2]">
              Como casi todo el mundo marca a los 3 candidatos de su partido, el más votado suele llevarse 3 escaños y el segundo,
              1. En 2023 pasó en {threeOne} de las {fourSeat.length} provincias. Cuando los dos primeros van casi empatados, el
              resultado puede quedar 2-2.
            </p>
          </div>
        </div>
        <RecountLive constituencies={constituencies} initial="429" evenSplits={evenSplits} />
      </div>
    </section>
  );
}
