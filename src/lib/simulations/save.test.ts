import { describe, expect, it } from "vitest";
import { defaultBase } from "@/lib/elections/bases";
import { baselineOf } from "@/lib/scenario/baselines";
import { encodeScenario } from "@/lib/scenario/url";
import { type InsertIfRoom, saveSimulationAs } from "./save";

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
    return room;
  };
  return { calls, insertIfRoom };
}

describe("saveSimulationAs", () => {
  it("stores the trimmed name for its owner", async () => {
    const { calls, insertIfRoom } = fakeInsert(true);
    expect(await saveSimulationAs("u1", form("  Empate  "), insertIfRoom)).toEqual({ saved: "Empate" });
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
