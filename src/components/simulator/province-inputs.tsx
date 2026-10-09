import { SelectField } from "@/components/forms/select-field";
import type { Base } from "@/lib/elections/bases";
import type { Bloc } from "@/lib/elections/types";
import { AdjustToggle } from "./adjust-toggle";
import { OffTargetWarning } from "./off-target-warning";
import { ShareBudget } from "./share-budget";
import { ShareRows } from "./share-rows";
import { PROVINCE_INPUTS_ID } from "./ids";

type ProvinceInputsProps = {
  blocs: readonly Bloc[];
  // The election the votes start from and seats compare against (FR-01).
  base: Pick<Base, "label" | "short">;
  // The blocs with a row here: those that run in the province.
  rowBlocs: readonly Bloc[];
  provinces: readonly { code: string; name: string }[];
  code: string;
  // Deputies the selected province elects.
  deputies: number;
  lockedCodes: readonly string[];
  // Shares of the province's valid votes: the locked ones, or the projection.
  shares: Readonly<Record<string, number>>;
  blank: number;
  others: number;
  seats: ReadonlyMap<string, number>;
  baseSeats: ReadonlyMap<string, number>;
  offTarget: readonly { blocId: string; requested: number; reached: number }[];
  stale: boolean;
  // Square the shares by hand instead of scaling the other parties.
  free: boolean;
  onFreeChange: (free: boolean) => void;
  onSelect: (code: string) => void;
  onShareChange: (blocId: string, value: number) => void;
  onBlankChange: (value: number) => void;
  onRebalance: () => void;
  onUnlock: () => void;
  onReset: () => void;
};

// FR-03: the shares of one province. Editing any of them locks it (P-07), and
// the national shares are then met with the other provinces.
export function ProvinceInputs(props: ProvinceInputsProps) {
  const { blocs, provinces, code, deputies, lockedCodes, offTarget, stale } = props;
  const locked = lockedCodes.includes(code);
  const nameOf = new Map(provinces.map((province) => [province.code, province.name]));
  return (
    <section id={PROVINCE_INPUTS_ID} aria-labelledby="inputs-title" className="flex scroll-mt-16 flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="inputs-title" className="text-tagline">
          Voto por provincia
        </h2>
        <button type="button" onClick={props.onReset} className="min-h-11 text-caption underline underline-offset-2">
          Volver a los resultados de {props.base.label}
        </button>
      </div>
      <SelectField
        label="Provincia"
        hint={deputies === 1 ? "Elige 1 diputado." : `Elige ${deputies} diputados.`}
        value={code}
        onChange={(event) => props.onSelect(event.target.value)}
        options={provinces.map((province) => ({
          value: province.code,
          label: lockedCodes.includes(province.code) ? `${province.name} (fijada)` : province.name,
        }))}
      />
      <div role="status" className="flex flex-wrap items-baseline justify-between gap-x-4 text-caption">
        {locked ? (
          <>
            <p>
              <span className="font-semibold">Fijada a mano.</span>{" "}
              <span className="text-ink-muted-80">El resto de provincias se ajusta para mantener el voto nacional.</span>
            </p>
            <button type="button" onClick={props.onUnlock} className="min-h-11 shrink-0 font-semibold underline underline-offset-2">
              Volver a la proyección
            </button>
          </>
        ) : (
          <p className="text-ink-muted-80">
            Proyección a partir del voto nacional. Si cambias un partido, la provincia queda fijada con tus porcentajes.
          </p>
        )}
      </div>
      <AdjustToggle free={props.free} onChange={props.onFreeChange} />
      <OffTargetWarning blocs={blocs} offTarget={offTarget} />
      <ShareBudget others={props.others} onRebalance={props.onRebalance} />
      <ShareRows
        idPrefix="province"
        legend={`Porcentaje de voto válido de cada partido en ${nameOf.get(code)}`}
        blocs={props.rowBlocs}
        baseLabel={props.base.short}
        shares={props.shares}
        blank={props.blank}
        seats={props.seats}
        baseSeats={props.baseSeats}
        stale={stale}
        onShareChange={props.onShareChange}
        onBlankChange={props.onBlankChange}
      />
      {lockedCodes.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-caption font-semibold">Provincias fijadas</h3>
          <ul className="flex flex-wrap gap-2">
            {lockedCodes.map((locked) => (
              <li key={locked}>
                <button
                  type="button"
                  aria-current={locked === code || undefined}
                  onClick={() => props.onSelect(locked)}
                  className="min-h-11 rounded-full border border-hairline px-4 text-caption aria-current:border-ink aria-current:font-semibold"
                >
                  {nameOf.get(locked)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
