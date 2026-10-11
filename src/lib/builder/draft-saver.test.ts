import { describe, expect, it, vi } from "vitest";
import { createDraftSaver } from "./draft-saver";
import type { DraftState } from "./save";

describe("draft save queue", () => {
  it("flushes a pending debounce immediately and advances the expected snapshot", async () => {
    const save = vi.fn(async (): Promise<DraftState> => ({ saved: true }));
    const saver = createDraftSaver("initial", "raw stored JSON", save);
    saver.update("edited");
    expect(await saver.flush()).toBe(true);
    saver.update("edited again");
    expect(await saver.flush()).toBe(true);
    expect(save.mock.calls).toEqual([["edited", "raw stored JSON"], ["edited again", "edited"]]);
    expect(saver.dirty).toBe(false);
  });

  it("navigation waits for an active save and edits made while it runs", async () => {
    const first = Promise.withResolvers<DraftState>();
    const save = vi.fn(async (): Promise<DraftState> => ({ saved: true })).mockReturnValueOnce(first.promise);
    const saver = createDraftSaver("initial", "initial", save);
    saver.update("first");
    const pending = saver.flush();
    saver.update("second");
    const navigation = saver.flush();
    expect(navigation).toBe(pending);
    expect(save).toHaveBeenCalledTimes(1);
    first.resolve({ saved: true });
    expect(await navigation).toBe(true);
    expect(save.mock.calls).toEqual([["first", "initial"], ["second", "first"]]);
  });

  it("saves a revert made while an earlier edit is in flight", async () => {
    const first = Promise.withResolvers<DraftState>();
    const save = vi.fn(async (): Promise<DraftState> => ({ saved: true })).mockReturnValueOnce(first.promise);
    const saver = createDraftSaver("initial", "initial", save);
    saver.update("first");
    const pending = saver.flush();
    saver.update("initial");
    expect(saver.dirty).toBe(true);
    first.resolve({ saved: true });
    await pending;
    expect(save.mock.calls).toEqual([["first", "initial"], ["initial", "first"]]);
  });

  it("blocks navigation on failure and keeps the revision and edit for retry", async () => {
    const save = vi.fn(async (): Promise<DraftState> => ({ saved: true })).mockRejectedValueOnce(new Error("offline"));
    const saver = createDraftSaver("initial", "initial", save);
    saver.update("edited");
    expect(await saver.flush()).toBe(false);
    expect(saver.dirty).toBe(true);
    expect(await saver.flush()).toBe(true);
    expect(save.mock.calls).toEqual([["edited", "initial"], ["edited", "initial"]]);
  });
});
