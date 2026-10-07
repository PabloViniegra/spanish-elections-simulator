import { useState } from "react";
import { fitsInFull } from "@/lib/scenario/simulate";
import type { Scenario } from "@/lib/scenario/types";

type Snapshot = {
  // What the inputs show, even while it does not fit in 100%.
  scenario: Scenario;
  // The last scenario that fits: the results and the address follow it.
  valid: Scenario;
};

// The scenario being edited, with one step of undo for the actions that throw
// edits away: resets and a change of base (FR-04). The notice says what
// happened, and whether it can still be undone; any later edit drops it.
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
