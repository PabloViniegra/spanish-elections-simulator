import type { Bloc } from "@/lib/elections/types";
import { MAJORITY, TOTAL_SEATS } from "@/lib/hemicycle-layout";

type CoalitionBarProps = {
  // Picked blocs with their seats, in the order of the chips.
  picked: readonly (Bloc & { seats: number })[];
  total: number;
};

const percent = (seats: number) => `${(seats / TOTAL_SEATS) * 100}%`;

// The picked blocs side by side against the 176 line. Decorative: the text
// below it states the same sum, so colour carries nothing on its own.
export function CoalitionBar({ picked, total }: CoalitionBarProps) {
  const reached = total >= MAJORITY;
  return (
    <div aria-hidden="true" className="flex flex-col gap-1.5">
      <div className="relative flex h-4 overflow-hidden rounded-full bg-divider-soft ring-1 ring-hairline ring-inset">
        {picked.map((bloc) => (
          <span
            key={bloc.id}
            className="h-full transition-[width] duration-300 ease-smooth motion-reduce:transition-none"
            style={{ width: percent(bloc.seats), backgroundColor: bloc.colour }}
          />
        ))}
        <span className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-ink" style={{ left: percent(MAJORITY) }} />
      </div>
      <div className="relative h-5 text-fine-print tabular-nums">
        <span className="absolute left-0 text-ink-muted-80">0</span>
        <span
          className={`absolute -translate-x-1/2 whitespace-nowrap ${reached ? "font-semibold text-ink" : "text-ink-muted-80"}`}
          style={{ left: percent(MAJORITY) }}
        >
          ▲ {MAJORITY}
        </span>
        <span className="absolute right-0 text-ink-muted-80">{TOTAL_SEATS}</span>
      </div>
    </div>
  );
}
