import { useState } from "react";
import { SAVED_PARAM } from "@/lib/scenario/address";
import type { SavedTarget } from "./save-simulation";

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
