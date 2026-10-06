import type { Bloc } from "@/lib/elections/types";
import { formatDelta, formatShare } from "./format";
import { ShareInput } from "./share-input";

type NationalInputsProps = {
  blocs: readonly Bloc[];
  shares: Readonly<Record<string, number>>;
  blank: number;
  others: number;
  seats: ReadonlyMap<string, number>;
  baseSeats: ReadonlyMap<string, number>;
  // Blocs pulled off their target (P-05), with the share reached.
  offTarget: readonly { blocId: string; requested: number; reached: number }[];
  onShareChange: (blocId: string, value: number) => void;
  onBlankChange: (value: number) => void;
  onReset: () => void;
};

// FR-02: one row per bloc with its national share and the seats it gets.
export function NationalInputs(props: NationalInputsProps) {
  const { blocs, shares, blank, others, seats, baseSeats, offTarget, onShareChange, onBlankChange, onReset } = props;
  const nameOf = new Map(blocs.map((bloc) => [bloc.id, bloc.name]));
  return (
    <section aria-labelledby="inputs-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="inputs-title" className="text-tagline">
          Estimación de voto
        </h2>
        <button type="button" onClick={onReset} className="min-h-11 text-caption text-primary underline-offset-2 hover:underline">
          Volver a los resultados de 2023
        </button>
      </div>
      {offTarget.length > 0 && (
        <div role="status" className="rounded-sm border border-error p-3 text-caption">
          <p className="font-semibold">No se pueden cumplir todos los porcentajes.</p>
          <p className="text-ink-muted-80">
            Algún partido solo se presenta en ciertas provincias y no le caben tantos votos. El reparto usa:{" "}
            {offTarget
              .map(({ blocId, requested, reached }) => `${nameOf.get(blocId)} ${formatShare(reached)} (pides ${formatShare(requested)})`)
              .join(", ")}
            .
          </p>
        </div>
      )}
      <fieldset className="flex flex-col">
        <legend className="sr-only">Porcentaje de voto válido de cada partido</legend>
        <div aria-hidden="true" className="flex justify-between border-b border-hairline pb-2 text-fine-print text-ink-muted-80">
          <span>Partido y % de voto válido</span>
          <span>Escaños</span>
        </div>
        {blocs.map((bloc) => {
          const blocSeats = seats.get(bloc.id) ?? 0;
          const delta = blocSeats - (baseSeats.get(bloc.id) ?? 0);
          return (
            <div key={bloc.id} className="grid grid-cols-[1fr_3rem] items-center gap-x-4 gap-y-1 border-b border-hairline py-3">
              <label htmlFor={`share-${bloc.id}`} className="flex items-center gap-2 text-body font-semibold">
                <span aria-hidden="true" className="size-3 shrink-0 rounded-full" style={{ backgroundColor: bloc.colour }} />
                {bloc.name}
              </label>
              <p className="row-span-2 text-right tabular-nums">
                <span className="block text-tagline">{blocSeats}</span>
                <span className="block text-fine-print text-ink-muted-80">
                  {formatDelta(delta)}
                  <span className="sr-only"> respecto a 2023</span>
                </span>
              </p>
              <ShareInput
                id={`share-${bloc.id}`}
                label={bloc.name}
                value={shares[bloc.id] ?? 0}
                onChange={(value) => onShareChange(bloc.id, value)}
              />
            </div>
          );
        })}
        <div className="grid grid-cols-[1fr_3rem] items-center gap-x-4 gap-y-1 border-b border-hairline py-3">
          <label htmlFor="share-blank" className="text-body">
            Voto en blanco
          </label>
          <span />
          <ShareInput id="share-blank" label="Voto en blanco" value={blank} onChange={onBlankChange} />
        </div>
        <p className="flex justify-between gap-4 py-3 text-body">
          <span>Otros partidos (sin escaño en la simulación)</span>
          <span className={`whitespace-nowrap tabular-nums ${others < 0 ? "font-semibold text-error" : ""}`}>{formatShare(others)}</span>
        </p>
        {others < 0 && (
          <p role="alert" className="text-caption text-error">
            Los porcentajes suman más del 100 %. Baja alguno para ver el nuevo reparto.
          </p>
        )}
      </fieldset>
    </section>
  );
}
