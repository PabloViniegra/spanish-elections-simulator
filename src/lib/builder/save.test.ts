import { describe, expect, it } from "vitest";
import type { InsertIfRoom } from "@/lib/simulations/save";
import type { BuilderReference } from "./allocate";
import { createBuiltAs, saveBuiltDraftAs, type UpdateOwnedBuilt } from "./save";
import { validBuilt } from "./schema";
import type { BuiltParty, BuiltScenario } from "./types";

const reference: BuilderReference = {
  census: new Map(),
  catalog: new Map([["pp", { id: "pp", acronym: "PP", name: "PARTIDO POPULAR", colour: "#1d84ce", provinces: ["28"], lastElection: "2023-07" }]]),
};
const parties: BuiltParty[] = [
  { id: "pp", name: "PP", colour: "#1d84ce", catalogId: "pp" },
  { id: "c1", name: "Mi partido", colour: "#123abc" },
];
const scenario: BuiltScenario = { schemaVersion: 1, seatTable: "2026", parties, provinces: {} };

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

// Records every insert and reports whether there was room for it.
function fakeInsert(room: boolean) {
  const calls: Parameters<InsertIfRoom>[] = [];
  const insertIfRoom: InsertIfRoom = async (...args) => {
    calls.push(args);
    return room ? "new-id" : null;
  };
  return { calls, insertIfRoom };
}

// Records every update and answers with the next revision, or null when the
// election was not found.
function fakeUpdate(found: boolean) {
  const calls: Parameters<UpdateOwnedBuilt>[] = [];
  const updateOwned: UpdateOwnedBuilt = async (...args) => {
    calls.push(args);
    return found ? args[3] + 1 : null;
  };
  return { calls, updateOwned };
}

describe("validBuilt", () => {
  it("accepts catalogue parties the catalogue has and parties the user invented", () => {
    expect(validBuilt(JSON.stringify(scenario), reference)).toEqual(scenario);
  });

  it("rejects a catalogue party the catalogue does not have", () => {
    const unknown = { ...scenario, parties: [{ id: "x", name: "X", colour: "#000000", catalogId: "x" }] };
    expect(validBuilt(JSON.stringify(unknown), reference)).toBeNull();
  });
});

describe("createBuiltAs", () => {
  const fields = { name: "  Mis elecciones ", seatTable: "2026", parties: JSON.stringify(parties) };

  it("stores an empty built election under the trimmed name", async () => {
    const { calls, insertIfRoom } = fakeInsert(true);
    expect(await createBuiltAs("u1", form(fields), insertIfRoom, reference)).toEqual({ saved: "Mis elecciones", id: "new-id" });
    expect(calls).toEqual([["u1", "Mis elecciones", JSON.stringify(scenario), "built"]]);
  });

  it("asks to sign in again without a session", async () => {
    const { calls, insertIfRoom } = fakeInsert(true);
    expect(await createBuiltAs(undefined, form(fields), insertIfRoom, reference)).toEqual({
      error: "Tu sesión ha caducado. Inicia sesión de nuevo para guardar.",
    });
    expect(calls).toEqual([]);
  });

  it("returns field errors for a missing name, seat table or party list", async () => {
    const { calls, insertIfRoom } = fakeInsert(true);
    const state = await createBuiltAs("u1", form({ name: " ", seatTable: "2019", parties: "" }), insertIfRoom, reference);
    expect(Object.keys(state?.fieldErrors ?? {}).sort()).toEqual(["name", "parties", "seatTable"]);
    expect(calls).toEqual([]);
  });

  it("rejects broken, empty or unknown party lists", async () => {
    const { calls, insertIfRoom } = fakeInsert(true);
    for (const list of ["{", "[]", JSON.stringify([{ id: "x", name: "X", colour: "#000000", catalogId: "x" }])]) {
      const state = await createBuiltAs("u1", form({ ...fields, parties: list }), insertIfRoom, reference);
      expect(state?.fieldErrors?.parties).toBeDefined();
    }
    expect(calls).toEqual([]);
  });

  it("stores the votes of an imported file", async () => {
    const { calls, insertIfRoom } = fakeInsert(true);
    const provinces = { "28": { votes: { pp: 10, c1: 5 }, blank: 1, null: 0 } };
    await createBuiltAs("u1", form({ ...fields, provinces: JSON.stringify(provinces) }), insertIfRoom, reference);
    expect(calls).toEqual([["u1", "Mis elecciones", JSON.stringify({ ...scenario, provinces }), "built"]]);
  });

  it("rejects imported votes that are broken or name another party or province", async () => {
    const { calls, insertIfRoom } = fakeInsert(true);
    for (const provinces of ["{", JSON.stringify({ "28": { votes: { x: 1 }, blank: 0, null: 0 } }), JSON.stringify({ "99": { votes: {}, blank: 0, null: 0 } })]) {
      expect(await createBuiltAs("u1", form({ ...fields, provinces }), insertIfRoom, reference)).toEqual({ error: "Los votos importados no son válidos." });
    }
    expect(calls).toEqual([]);
  });

  it("explains how to make room when the account is full", async () => {
    const { insertIfRoom } = fakeInsert(false);
    expect(await createBuiltAs("u1", form(fields), insertIfRoom, reference)).toEqual({
      error: "Ya tienes 100 simulaciones guardadas. Borra alguna desde tu perfil para crear otra.",
    });
  });
});

describe("saveBuiltDraftAs", () => {
  const draft = JSON.stringify({ ...scenario, provinces: { "28": { votes: { pp: 10 }, blank: 1, null: 0 } } });

  it("overwrites the scenario of an election the user owns", async () => {
    const { calls, updateOwned } = fakeUpdate(true);
    expect(await saveBuiltDraftAs("u1", "s1", draft, updateOwned, reference, 4)).toEqual({ saved: true, revision: 5 });
    expect(calls).toEqual([["u1", "s1", draft, 4]]);
  });

  it("stores nothing without a session or with an invalid scenario", async () => {
    const { calls, updateOwned } = fakeUpdate(true);
    expect(await saveBuiltDraftAs(undefined, "s1", draft, updateOwned, reference, 0)).toHaveProperty("error");
    expect(await saveBuiltDraftAs("u1", "s1", "{", updateOwned, reference, 0)).toHaveProperty("error");
    expect(await saveBuiltDraftAs("u1", "", draft, updateOwned, reference, 0)).toHaveProperty("error");
    expect(calls).toEqual([]);
  });

  it("reports an election that is gone or belongs to someone else", async () => {
    const { updateOwned } = fakeUpdate(false);
    expect(await saveBuiltDraftAs("u1", "s1", draft, updateOwned, reference, 0)).toEqual({ error: "No se han guardado los cambios: estas elecciones han cambiado en otra pestaña o ya no están en tu perfil. Conserva tus cambios antes de recargar." });
  });

  it("rejects a stale tab without overwriting an acknowledged edit", async () => {
    let stored = { scenario: JSON.stringify(scenario), revision: 0 };
    const update: UpdateOwnedBuilt = async (_user, _id, next, revision) => {
      if (stored.revision !== revision) return null;
      stored = { scenario: next, revision: revision + 1 };
      return stored.revision;
    };
    expect(await saveBuiltDraftAs("u1", "s1", draft, update, reference, 0)).toEqual({ saved: true, revision: 1 });
    expect(await saveBuiltDraftAs("u1", "s1", JSON.stringify(scenario), update, reference, 0)).toHaveProperty("error");
    expect(stored.scenario).toBe(draft);
  });
});
