import type { Base } from "@/lib/elections/bases";
import { baselineOf } from "@/lib/scenario/baselines";
import { addBloc, candidacyRows, MAX_BLOCS, moveCandidacy, recolourBloc, removeBloc, renameBloc, scenarioBlocs } from "@/lib/scenario/blocs";
import type { Scenario } from "@/lib/scenario/types";
import { BlocManager } from "./bloc-manager";

type BlocManagerContainerProps = {
  base: Base;
  scenario: Scenario;
  onChange: (next: Scenario) => void;
  // For the changes that throw edits away, which can be undone (FR-04).
  onRestart: (next: Scenario, message: string) => void;
};

// FR-11: the bloc edits of the scenario being edited.
export function BlocManagerContainer({ base, scenario, onChange, onRestart }: BlocManagerContainerProps) {
  const blocs = scenarioBlocs(scenario, base);
  return (
    <BlocManager
      blocs={blocs}
      candidacies={candidacyRows(scenario, base)}
      baseLabel={base.label}
      baseShort={base.short}
      canAdd={blocs.length < MAX_BLOCS}
      edited={scenario.blocs !== undefined}
      onRename={(blocId, name) => onChange(renameBloc(scenario, base, blocId, name))}
      onRecolour={(blocId, colour) => onChange(recolourBloc(scenario, base, blocId, colour))}
      onMove={(candidacyId, blocId) => onChange(moveCandidacy(scenario, base, candidacyId, blocId))}
      onAdd={() => onChange(addBloc(scenario, base))}
      onRemove={(blocId) => {
        const name = blocs.find((bloc) => bloc.id === blocId)?.name;
        onRestart(removeBloc(scenario, base, blocId), `${name} quitado: su voto pasa a «Otros».`);
      }}
      onRestore={() => onRestart(baselineOf(base).scenario, `Partidos y votos de ${base.label} restablecidos.`)}
    />
  );
}
