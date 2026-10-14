import { useState } from "react";
import { fitsInFull } from "@/lib/scenario/simulate";
import type { Scenario } from "@/lib/scenario/types";

type Snapshot = {
  scenario: Scenario;
  valid: Scenario;
};

// One step of undo for the actions that throw edits away (FR-04); any later edit drops it.
export function useScenario(initial: Scenario) {
  const [current, setCurrent] = useState<Snapshot>({ scenario: initial, valid: initial });
  const [notice, setNotice] = useState<{ message: string; snapshot: Snapshot | null } | null>(null);
  const next = (scenario: Scenario): Snapshot => ({ scenario, valid: fitsInFull(scenario) ? scenario : current.valid });

  return {
    ...current,
    notice: notice && { message: notice.message, undoable: notice.snapshot !== null },
    update: (scenario: Scenario) => {
      setCurrent(next(scenario));
      setNotice(null);
    },
    discard: (scenario: Scenario, message: string) => {
      setCurrent(next(scenario));
      setNotice({ message, snapshot: current });
    },
    undo: () => {
      if (!notice?.snapshot) return;
      setCurrent(notice.snapshot);
      setNotice({ message: "Cambio deshecho.", snapshot: null });
    },
  };
}
