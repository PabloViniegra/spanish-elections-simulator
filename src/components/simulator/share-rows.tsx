import type { Bloc } from "@/lib/elections/types";
import { formatDelta } from "./format";
import { ShareInput } from "./share-input";

type ShareRowsProps = {
  // Prefix for field ids, unique per mode.
  idPrefix: string;
  legend: string;
  blocs: readonly Bloc[];
  // The base election the seat changes compare against, e.g. "2023".
  baseLabel: string;
  shares: Readonly<Record<string, number>>;
  blank: number;
  seats: ReadonlyMap<string, number>;
  baseSeats: ReadonlyMap<string, number>;
  // Seats are out of date while the shares do not fit in 100%.
  stale: boolean;
  onShareChange: (blocId: string, value: number) => void;
  onBlankChange: (value: number) => void;
};

// One row per bloc with its share and the seats it gets, then the blank vote.
export function ShareRows(props: ShareRowsProps) {
  const { idPrefix, legend, blocs, baseLabel, shares, blank, seats, baseSeats, stale, onShareChange, onBlankChange } = props;
  return (
    <fieldset className="flex flex-col">
      <legend className="sr-only">{legend}</legend>
      <div aria-hidden="true" className="flex justify-between border-b border-hairline pb-2 text-fine-print text-ink-muted-80">
        <span>Partido y % de voto válido</span>
        <span>Escaños (frente a {baseLabel})</span>
      </div>
      {blocs.map((bloc) => {
        const blocSeats = seats.get(bloc.id) ?? 0;
        const delta = blocSeats - (baseSeats.get(bloc.id) ?? 0);
        return (
          <div key={bloc.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 border-b border-hairline py-3 sm:grid-cols-[1fr_3rem]">
            <label htmlFor={`${idPrefix}-${bloc.id}`} className="flex items-center gap-2 text-body font-semibold">
              <span aria-hidden="true" className="size-3 shrink-0 rounded-full" style={{ backgroundColor: bloc.colour }} />
              {bloc.name}
            </label>
            <p className={`flex items-baseline justify-end gap-2 text-right tabular-nums transition-opacity sm:row-span-2 sm:block ${stale ? "opacity-40" : ""}`}>
              <span key={`seats-${blocSeats}`} className="tick text-tagline sm:block">
                {blocSeats}
              </span>
              <span key={`delta-${delta}`} className={`tick text-caption sm:block ${delta === 0 ? "text-ink-muted-80" : "font-semibold"}`}>
                {formatDelta(delta)}
                <span className="sr-only"> respecto a {baseLabel}</span>
              </span>
            </p>
            <div className="col-span-2 sm:col-span-1">
              <ShareInput
                id={`${idPrefix}-${bloc.id}`}
                label={bloc.name}
                colour={bloc.colour}
                value={shares[bloc.id] ?? 0}
                onChange={(value) => onShareChange(bloc.id, value)}
              />
            </div>
          </div>
        );
      })}
      <div className="flex flex-col gap-1 border-b border-hairline py-3">
        <label htmlFor={`${idPrefix}-blank`} className="text-body">
          Voto en blanco
        </label>
        <ShareInput id={`${idPrefix}-blank`} label="Voto en blanco" value={blank} onChange={onBlankChange} />
      </div>
    </fieldset>
  );
}
