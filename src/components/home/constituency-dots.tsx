import { cssVar } from "@/lib/css-var";
import { simulationSeats } from "@/lib/elections/current";

const compared = [
  { code: "42", name: "Soria" },
  { code: "28", name: "Madrid" },
];

// Every constituency starts from the same 2 seats; the rest follow population.
const BASE_SEATS = 2;

// One dot per seat on a shared 13-column grid, so both constituencies are
// drawn at the same scale and the difference reads as area. The 2 base seats
// are solid ink in both; Madrid's population seats are the lighter surplus.
export function ConstituencyDots() {
  return (
    <div className="flex flex-col gap-10">
      {compared.map(({ code, name }) => {
        const seats = simulationSeats.get(code) ?? 0;
        const extra = seats - BASE_SEATS;
        return (
          <div key={code} className="flex flex-col gap-4">
            <p className="flex flex-wrap items-baseline gap-x-3 text-caption text-ink-muted-80">
              <span className="font-semibold text-ink">{name}</span>
              <span className="tabular-nums">
                {extra > 0 ? `${BASE_SEATS} de base + ${extra} por población` : `${BASE_SEATS} de base`}
              </span>
            </p>
            <ul aria-hidden="true" className="reveal-scope grid w-fit grid-cols-13 gap-1.5 sm:gap-2">
              {Array.from({ length: seats }, (_, i) => (
                <li
                  key={i}
                  style={cssVar("--i", i)}
                  className={`reveal-dot size-[clamp(1rem,4.2vw,1.5rem)] rounded-full transition-transform duration-300 ease-out hover:scale-125 lg:size-[clamp(1.5rem,2.6vw,2rem)] ${
                    i < BASE_SEATS ? "bg-ink" : "bg-ink-muted-48"
                  }`}
                />
              ))}
            </ul>
            <p className="sr-only">
              {name}, {seats} escaños
            </p>
          </div>
        );
      })}
    </div>
  );
}
