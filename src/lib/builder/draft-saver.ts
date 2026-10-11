import type { DraftState } from "./save";

export type SaveStatus = { kind: "saved" } | { kind: "pending" } | { kind: "saving" } | { kind: "error"; message: string };
type Save = (json: string, expected: string) => Promise<DraftState>;
const offline = "No se han podido guardar los cambios. Revisa tu conexión.";

// All callers, including navigation, wait for the same queue to drain.
export function createDraftSaver(initial: string, stored: string, save: Save) {
  let latest = initial;
  let saved = initial;
  let expected = stored;
  let active: Promise<boolean> | null = null;
  let status: SaveStatus = { kind: "saved" };
  let listener: ((status: SaveStatus) => void) | null = null;

  const publish = (next: SaveStatus) => {
    status = next;
    listener?.(next);
  };
  const drain = async () => {
    while (latest !== saved) {
      const sending = latest;
      publish({ kind: "saving" });
      const result = await save(sending, expected).catch(() => ({ error: offline }));
      if ("error" in result) {
        publish({ kind: "error", message: result.error });
        return false;
      }
      expected = sending;
      saved = sending;
    }
    publish({ kind: "saved" });
    return true;
  };

  return {
    get dirty() { return active !== null || latest !== saved; },
    subscribe(next: typeof listener) {
      listener = next;
      listener?.(status);
    },
    update(json: string) {
      latest = json;
      if (!active) publish({ kind: latest === saved ? "saved" : "pending" });
    },
    flush() {
      active ??= drain().finally(() => { active = null; });
      return active;
    },
  };
}
