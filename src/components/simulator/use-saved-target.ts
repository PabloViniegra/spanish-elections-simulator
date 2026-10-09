import { useState } from "react";
import { SAVED_PARAM } from "@/lib/scenario/address";
import type { SavedTarget } from "./save-simulation";

// The saved simulation "Guardar cambios" overwrites: the one opened from the
// profile, then whichever was saved last. The address keeps it for a reload.
export function useSavedTarget(initial: SavedTarget | null) {
  const [target, setTarget] = useState(initial);
  const keep = (next: SavedTarget) => {
    setTarget(next);
    const url = new URL(window.location.href);
    url.searchParams.set(SAVED_PARAM, next.id);
    window.history.replaceState(null, "", url);
  };
  return [target, keep] as const;
}
