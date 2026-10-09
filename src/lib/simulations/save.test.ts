import { describe, expect, it } from "vitest";
import { defaultBase } from "@/lib/elections/bases";
import { baselineOf } from "@/lib/scenario/baselines";
import { encodeScenario } from "@/lib/scenario/url";
import { type InsertIfRoom, saveSimulationAs, type UpdateOwned, updateSimulationAs } from "./save";

const scenario = encodeScenario(baselineOf(defaultBase).scenario);

function form(name: string, scenarioParam = scenario) {
  const data = new FormData();
  data.set("name", name);
  data.set("scenario", scenarioParam);
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

describe("saveSimulationAs", () => {
  it("stores the trimmed name for its owner", async () => {
    const { calls, insertIfRoom } = fakeInsert(true);
    expect(await saveSimulationAs("u1", form("  Empate  "), insertIfRoom)).toEqual({ saved: "Empate", id: "new-id" });
    expect(calls).toEqual([["u1", "Empate", scenario]]);
  });

  it("asks to sign in again without a session", async () => {
    const { calls, insertIfRoom } = fakeInsert(true);
    expect(await saveSimulationAs(undefined, form("Empate"), insertIfRoom)).toEqual({
      error: "Tu sesión ha caducado. Inicia sesión de nuevo para guardar.",
    });
    expect(calls).toEqual([]);
  });

  it("returns field errors and stores nothing when the form is invalid", async () => {
    const { calls, insertIfRoom } = fakeInsert(true);
    const state = await saveSimulationAs("u1", form(" ", "v1.roto"), insertIfRoom);
    expect(Object.keys(state?.fieldErrors ?? {}).sort()).toEqual(["name", "scenario"]);
    expect(calls).toEqual([]);
  });

  it("explains how to make room when the account is full", async () => {
    const { insertIfRoom } = fakeInsert(false);
    expect(await saveSimulationAs("u1", form("Empate"), insertIfRoom)).toEqual({
      error: "Ya tienes 100 simulaciones guardadas. Borra alguna desde tu perfil para guardar otra.",
    });
  });
});

function updateForm(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

// Records every update and reports whether the simulation was found.
function fakeUpdate(found: boolean) {
  const calls: Parameters<UpdateOwned>[] = [];
  const updateOwned: UpdateOwned = async (...args) => {
    calls.push(args);
    return found;
  };
  return { calls, updateOwned };
}

describe("updateSimulationAs", () => {
  it("renames without touching the scenario", async () => {
    const { calls, updateOwned } = fakeUpdate(true);
    expect(await updateSimulationAs("u1", updateForm({ id: "s1", name: " Empate " }), updateOwned)).toEqual({ saved: "Empate", id: "s1" });
    expect(calls).toEqual([["u1", "s1", { name: "Empate", scenario: undefined }]]);
  });

  it("overwrites the scenario when one is sent", async () => {
    const { calls, updateOwned } = fakeUpdate(true);
    await updateSimulationAs("u1", updateForm({ id: "s1", name: "Empate", scenario }), updateOwned);
    expect(calls).toEqual([["u1", "s1", { name: "Empate", scenario }]]);
  });

  it("rejects a broken scenario and an empty name", async () => {
    const { calls, updateOwned } = fakeUpdate(true);
    const state = await updateSimulationAs("u1", updateForm({ id: "s1", name: " ", scenario: "v1.roto" }), updateOwned);
    expect(Object.keys(state?.fieldErrors ?? {}).sort()).toEqual(["name", "scenario"]);
    expect(calls).toEqual([]);
  });

  it("asks to sign in again without a session", async () => {
    const { calls, updateOwned } = fakeUpdate(true);
    expect(await updateSimulationAs(undefined, updateForm({ id: "s1", name: "Empate" }), updateOwned)).toEqual({
      error: "Tu sesión ha caducado. Inicia sesión de nuevo para guardar.",
    });
    expect(calls).toEqual([]);
  });

  it("suggests saving it as new when it is gone or belongs to someone else", async () => {
    const { updateOwned } = fakeUpdate(false);
    expect(await updateSimulationAs("u1", updateForm({ id: "s1", name: "Empate" }), updateOwned)).toEqual({
      error: "Esta simulación ya no está en tu perfil. Guárdala como nueva.",
    });
  });
});
