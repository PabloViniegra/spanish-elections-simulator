import type { Bloc } from "@/lib/elections/types";
import { OffTargetWarning } from "./off-target-warning";
import { ShareBudget } from "./share-budget";
import { ShareRows } from "./share-rows";

type NationalInputsProps = {
  blocs: readonly Bloc[];
  shares: Readonly<Record<string, number>>;
  blank: number;
  others: number;
  seats: ReadonlyMap<string, number>;
  baseSeats: ReadonlyMap<string, number>;
  offTarget: readonly { blocId: string; requested: number; reached: number }[];
  // Provinces edited by hand, which the national shares work around.
  lockedCount: number;
  stale: boolean;
  onShareChange: (blocId: string, value: number) => void;
  onBlankChange: (value: number) => void;
  onRebalance: () => void;
  onReset: () => void;
};

// FR-02: one row per bloc with its national share and the seats it gets.
export function NationalInputs(props: NationalInputsProps) {
  const { blocs, shares, blank, others, seats, baseSeats, offTarget, lockedCount, stale } = props;
  return (
    <section aria-labelledby="inputs-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="inputs-title" className="text-tagline">
          Estimación de voto
        </h2>
        <button type="button" onClick={props.onReset} className="min-h-11 text-caption underline underline-offset-2">
          Volver a los resultados de 2023
        </button>
      </div>
      {lockedCount > 0 && (
        <p className="text-caption text-ink-muted-80">
          {lockedCount === 1 ? "Hay 1 provincia fijada" : `Hay ${lockedCount} provincias fijadas`} a mano. Para cumplir estos
          porcentajes solo se ajustan las demás.
        </p>
      )}
      <OffTargetWarning blocs={blocs} offTarget={offTarget} />
      <ShareBudget others={others} onRebalance={props.onRebalance} />
      <ShareRows
        idPrefix="share"
        legend="Porcentaje de voto válido de cada partido"
        blocs={blocs}
        shares={shares}
        blank={blank}
        seats={seats}
        baseSeats={baseSeats}
        stale={stale}
        onShareChange={props.onShareChange}
        onBlankChange={props.onBlankChange}
      />
    </section>
  );
}
