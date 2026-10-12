import { describe, expect, it, vi } from "vitest";
import { createDraftSaver } from "./draft-saver";
import type { DraftState } from "./save";

// A server that acknowledges each save with the next revision.
function acknowledging() {
  let revision = 0;
  return vi.fn(async (): Promise<DraftState> => ({ saved: true, revision: ++revision }));
}

describe("draft save queue", () => {
  it("flushes a pending debounce immediately and advances the expected revision", async () => {
    const save = acknowledging();
    const saver = createDraftSaver("initial", 0, save);
    saver.update("edited");
    expect(await saver.flush()).toBe(true);
    saver.update("edited again");
    expect(await saver.flush()).toBe(true);
    expect(save.mock.calls).toEqual([["edited", 0], ["edited again", 1]]);
    expect(saver.dirty).toBe(false);
  });

  it("navigation waits for an active save and edits made while it runs", async () => {
    const first = Promise.withResolvers<DraftState>();
    const save = vi.fn(async (): Promise<DraftState> => ({ saved: true, revision: 2 })).mockReturnValueOnce(first.promise);
    const saver = createDraftSaver("initial", 0, save);
    saver.update("first");
    const pending = saver.flush();
    saver.update("second");
    const navigation = saver.flush();
    expect(navigation).toBe(pending);
    expect(save).toHaveBeenCalledTimes(1);
    first.resolve({ saved: true, revision: 1 });
    expect(await navigation).toBe(true);
    expect(save.mock.calls).toEqual([["first", 0], ["second", 1]]);
  });

  it("saves a revert made while an earlier edit is in flight", async () => {
    const first = Promise.withResolvers<DraftState>();
    const save = vi.fn(async (): Promise<DraftState> => ({ saved: true, revision: 2 })).mockReturnValueOnce(first.promise);
    const saver = createDraftSaver("initial", 0, save);
    saver.update("first");
    const pending = saver.flush();
    saver.update("initial");
    expect(saver.dirty).toBe(true);
    first.resolve({ saved: true, revision: 1 });
    await pending;
    expect(save.mock.calls).toEqual([["first", 0], ["initial", 1]]);
  });

  it("blocks navigation on failure and keeps the revision and edit for retry", async () => {
    const save = acknowledging().mockRejectedValueOnce(new Error("offline"));
    const saver = createDraftSaver("initial", 0, save);
    saver.update("edited");
    expect(await saver.flush()).toBe(false);
    expect(saver.dirty).toBe(true);
    expect(await saver.flush()).toBe(true);
    expect(save.mock.calls).toEqual([["edited", 0], ["edited", 0]]);
  });

  it("sends nothing more once the draft is discarded", async () => {
    const save = acknowledging();
    const saver = createDraftSaver("initial", 0, save);
    saver.update("edited");
    saver.discard();
    saver.update("edited again");
    expect(saver.dirty).toBe(false);
    expect(await saver.flush()).toBe(true);
    expect(save).not.toHaveBeenCalled();
  });
});
