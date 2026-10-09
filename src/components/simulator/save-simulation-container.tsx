"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { notify } from "@/components/feedback/notify";
import { useFocusOnError } from "@/components/forms/use-focus-on-error";
import type { Scenario } from "@/lib/scenario/types";
import { encodeScenario } from "@/lib/scenario/address";
import { saveSimulation, updateSimulation } from "@/lib/simulations/actions";
import type { SaveState } from "@/lib/simulations/forms";
import { SaveSimulation, type SavedTarget, UPDATE_INTENT } from "./save-simulation";

type SaveSimulationContainerProps = {
  // The scenario the results show: the last one that fits in 100%.
  scenario: Scenario;
  ranked: readonly { name: string; seats: number }[];
  stale: boolean;
  saved: SavedTarget | null;
  onSaved: (target: SavedTarget) => void;
};

// Keyed by the scenario where it is used, so "saved" never outlives an edit.
export function SaveSimulationContainer({ scenario, ranked, stale, saved, onSaved }: SaveSimulationContainerProps) {
  const router = useRouter();
  const [state, action, pending] = useActionState(async (previous: SaveState, formData: FormData) => {
    const updating = formData.get("intent") === UPDATE_INTENT;
    const next = await (updating ? updateSimulation : saveSimulation)(previous, formData);
    if (next?.saved && next.id) {
      onSaved({ id: next.id, name: next.saved });
      notify.success({
        title: updating ? "Cambios guardados" : "Simulación guardada",
        description: `«${next.saved}» ya está en tu perfil.`,
        button: { title: "Ver mis simulaciones", onClick: () => router.push("/profile") },
      });
    }
    return next;
  }, undefined);
  const ref = useFocusOnError(state);
  const defaultName = ranked
    .slice(0, 3)
    .map(({ name, seats }) => `${name} ${seats}`)
    .join(" · ");
  return (
    <div ref={ref}>
      <SaveSimulation state={state} action={action} pending={pending} scenario={encodeScenario(scenario)} defaultName={defaultName} stale={stale} saved={saved} />
    </div>
  );
}
