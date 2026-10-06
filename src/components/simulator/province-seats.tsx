import type { Bloc } from "@/lib/elections/types";

export type ProvinceSplitProps = {
  province: { name: string; deputies: number; tied: boolean; seats: readonly { bloc: Bloc; seats: number }[] };
};

// Name, deputies and seats per bloc of one province: in the map's tooltip and
// in the panel below it.
export function ProvinceSplit({ province }: ProvinceSplitProps) {
  return (
    <>
      <p className="font-semibold">
        {province.name}{" "}
        <span className="font-normal text-ink-muted-80">
          · {province.deputies === 1 ? "1 escaño" : `${province.deputies} escaños`}
          {province.tied && " · empate en cabeza"}
        </span>
      </p>
      <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
        {province.seats.map(({ bloc, seats }) => (
          <li key={bloc.id} className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-2.5 rounded-full" style={{ backgroundColor: bloc.colour }} />
            {bloc.name} <span className="tabular-nums text-ink-muted-80">{seats}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

type ProvinceSeatsProps = {
  // Province tapped on a touch screen, or the one being edited; null for the hint.
  province: ProvinceSplitProps["province"] | null;
  // The province shown is the one being edited.
  editing: boolean;
  onEdit: () => void;
};

// Below the map: what a mouse sees in the tooltip, for touch screens, and in
// provincial mode which province the inputs edit, since they may be off-screen.
export function ProvinceSeats({ province, editing, onEdit }: ProvinceSeatsProps) {
  return (
    <div className="min-h-16 text-caption">
      {province ? (
        <>
          <ProvinceSplit province={province} />
          {editing && (
            <button type="button" onClick={onEdit} className="min-h-11 text-primary underline underline-offset-2">
              Editar el voto en {province.name}
            </button>
          )}
        </>
      ) : (
        <p className="max-w-prose text-ink-muted-80">Pasa el cursor o toca una provincia para ver su reparto. Todas están en la tabla de abajo.</p>
      )}
    </div>
  );
}
