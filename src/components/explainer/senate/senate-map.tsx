import map from "@/data/map/provinces.json";
import { constituency, senate2023 } from "@/lib/senate/senate";
import { sectionTitle } from "../../home/type";
import { type MapGroup, SenateMapLive } from "./senate-map-live";

type GroupId = MapGroup["id"];

const CITY_CODES = new Set(["51", "52"]);
const ISLAND_CODES = new Set(["07", "35", "38"]);
const groupOf = (province: string): GroupId => (CITY_CODES.has(province) ? "cities" : ISLAND_CODES.has(province) ? "islands" : "provinces");

const constituencies = senate2023.constituencies;
const madrid = constituency("289");
const soria = constituency("429");
const pins = [madrid, soria].map(({ province, name, seats }) => {
  const outline = map.provinces.find((item) => item.code === province);
  if (!outline) throw new Error(`No map shape for province ${province}`);
  return { name, seats, left: `${(outline.x / map.width) * 100}%`, top: `${(outline.y / map.height) * 100}%` };
});
const format = (n: number) => n.toLocaleString("es-ES", { useGrouping: "always" });
const groups: MapGroup[] = (
  [
    { id: "provinces", label: "Provincias", note: "Las 47 provincias de la península eligen 4 senadores cada una, tengan los habitantes que tengan." },
    { id: "islands", label: "Islas", note: "En Baleares y Canarias no vota la provincia, sino cada isla o grupo de islas." },
    { id: "cities", label: "Ceuta y Melilla", note: "Cada ciudad autónoma elige 2 senadores." },
  ] as const
).map((group) => {
  const members = constituencies.filter((item) => groupOf(item.province) === group.id);
  return {
    ...group,
    constituencies: members.length,
    seats: members.reduce((sum, item) => sum + item.seats, 0),
    detail: group.id === "provinces" ? [] : members.map(({ code, name, seats }) => ({ code, name, seats })),
  };
});

// Static classes per group so Tailwind can see them; the live wrapper sets data-active.
const LIT = {
  provinces: "group-data-[active=provinces]/map:fill-ink",
  islands: "group-data-[active=islands]/map:fill-ink",
  cities: "group-data-[active=cities]/map:fill-ink",
} satisfies Record<GroupId, string>;

export function SenateMap() {
  return (
    <section aria-labelledby="senate-map-title" className="overflow-clip bg-canvas-parchment">
      <div className="relative mx-auto grid max-w-content gap-12 px-5 py-section sm:px-8 lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-16 lg:py-40">
        <div className="rise-scope rise-side flex flex-col gap-5">
          <h2 id="senate-map-title" className={`rise [--c:0] ${sectionTitle}`}>
            Soria elige tantos senadores como Madrid
          </h2>
          <p className="rise max-w-[30rem] text-body text-pretty text-ink-muted-80 [--c:1]">
            En el Congreso, Madrid elige muchos más diputados que Soria. En el Senado, las dos eligen 4, aunque en 2023 Madrid
            tenía {format(madrid.census)} electores y Soria, {format(soria.census)}: cada elector de Soria pesa unas{" "}
            {Math.round(madrid.census / soria.census)} veces más.
          </p>
          <p className="rise max-w-[30rem] text-caption text-pretty text-ink-muted-80 [--c:2]">
            Las excepciones son las islas y las ciudades autónomas.
          </p>
        </div>
        <SenateMapLive groups={groups}>
          <div className="relative">
            <svg viewBox={`0 0 ${map.width} ${map.height}`} aria-hidden="true" className="w-full drop-shadow-[3px_5px_30px_rgb(0_0_0/0.22)]">
              <path d={map.inset} fill="none" className="stroke-ink-muted-48" strokeWidth={1} />
              {map.provinces.map(({ code, d, x, y }) => {
                const lit = `fill-ink-muted-48/35 transition-[fill] duration-200 ease-[ease] motion-reduce:transition-none ${LIT[groupOf(code)]}`;
                return CITY_CODES.has(code) ? (
                  <circle key={code} cx={x} cy={y} r={5} className={lit} />
                ) : (
                  <path key={code} d={d} strokeWidth={0.8} className={`${lit} stroke-canvas-parchment`} />
                );
              })}
            </svg>
            {pins.map(({ name, seats, left, top }) => (
              <span
                key={name}
                aria-hidden="true"
                style={{ left, top }}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-canvas px-2 py-0.5 text-fine-print font-semibold whitespace-nowrap text-ink scale-96 opacity-0 shadow-[0_0_0_1px_var(--color-hairline)] transition-[opacity,scale] duration-200 ease-snappy group-data-[active=provinces]/map:scale-100 group-data-[active=provinces]/map:opacity-100 motion-reduce:transition-none"
              >
                {name} · {seats}
              </span>
            ))}
          </div>
        </SenateMapLive>
      </div>
    </section>
  );
}
