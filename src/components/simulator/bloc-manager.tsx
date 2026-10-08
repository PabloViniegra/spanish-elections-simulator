import type { Bloc } from "@/lib/elections/types";
import { BlocRow } from "./bloc-row";
import { type CandidacyRow, CandidacyList } from "./candidacy-list";

type BlocManagerProps = {
  blocs: readonly Bloc[];
  candidacies: readonly CandidacyRow[];
  // The base election, as "julio de 2023" and "2023".
  baseLabel: string;
  baseShort: string;
  canAdd: boolean;
  // True once the blocs differ from the default ones.
  edited: boolean;
  onRename: (blocId: string, name: string) => void;
  onRecolour: (blocId: string, colour: string) => void;
  onMove: (candidacyId: string, blocId: string | null) => void;
  onAdd: () => void;
  onRemove: (blocId: string) => void;
  onRestore: () => void;
};

// FR-11: rename and recolour the blocs, choose which candidacies count with
// each one, and add or take away blocs. Folded away: most users never need it.
export function BlocManager(props: BlocManagerProps) {
  const { blocs } = props;
  return (
    <details className="border-y border-hairline">
      <summary className="min-h-11 cursor-pointer py-3 text-body font-semibold">Editar partidos</summary>
      <div className="flex flex-col gap-4 pb-4">
        <p className="text-caption text-pretty text-ink-muted-80">
          Cambia el nombre o el color de un partido, añade uno nuevo o decide con qué partido cuenta cada candidatura. Una candidatura que cambia
          de partido se lleva su porcentaje de {props.baseShort}; las que no cuentan con ninguno van a «Otros».
        </p>
        <ul aria-label="Partidos" className="flex flex-col border-t border-hairline">
          {blocs.map((bloc) => (
            <BlocRow
              key={bloc.id}
              bloc={bloc}
              removable={blocs.length > 1}
              onRename={(name) => props.onRename(bloc.id, name)}
              onRecolour={(colour) => props.onRecolour(bloc.id, colour)}
              onRemove={() => props.onRemove(bloc.id)}
            />
          ))}
        </ul>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-caption">
          <button
            type="button"
            onClick={props.onAdd}
            disabled={!props.canAdd}
            className="min-h-11 rounded-sm bg-primary px-4 text-on-primary transition-[scale,background-color] duration-200 ease-snappy active:scale-[0.97] disabled:bg-ink-muted-48"
          >
            Añadir partido
          </button>
          {!props.canAdd && <span className="text-ink-muted-80">Has llegado al máximo de {blocs.length} partidos.</span>}
          {props.edited && (
            <button type="button" onClick={props.onRestore} className="min-h-11 underline underline-offset-2">
              Volver a los partidos de {props.baseLabel}
            </button>
          )}
        </div>
        <CandidacyList candidacies={props.candidacies} blocs={blocs} baseLabel={props.baseShort} onMove={props.onMove} />
      </div>
    </details>
  );
}
