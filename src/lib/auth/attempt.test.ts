import { APIError } from "better-auth/api";
import { describe, expect, it } from "vitest";
import type { Consume, Limit } from "@/lib/rate-limit/rules";
import { attemptAuth } from "./attempt";

const values = { identifier: "ana" };
const limits: Limit[] = [["sign-in|ip|1.2.3.4", { window: 60, max: 10 }]];
const allow: Consume = async () => ({ retryAfter: null });

// Records whether the auth call ran and fails it with `error` when given.
function fakeCall(error?: Error) {
  const calls: number[] = [];
  const call = async () => {
    calls.push(calls.length);
    if (error) throw error;
  };
  return { calls, call };
}

describe("attemptAuth", () => {
  it("runs the call and returns no form state when it succeeds", async () => {
    const { calls, call } = fakeCall();
    expect(await attemptAuth(values, limits, allow, call)).toBeUndefined();
    expect(calls).toHaveLength(1);
  });

  it("skips the call while a limit is exhausted", async () => {
    const { calls, call } = fakeCall();
    const state = await attemptAuth(values, limits, async () => ({ retryAfter: 90 }), call);
    expect(state).toEqual({ values, error: "Demasiados intentos. Vuelve a probar dentro de 2 minutos." });
    expect(calls).toHaveLength(0);
  });

  it("turns a Better Auth rejection into a form error that keeps the values", async () => {
    const { call } = fakeCall(new APIError("UNAUTHORIZED", { code: "INVALID_USERNAME_OR_PASSWORD" }));
    expect(await attemptAuth(values, limits, allow, call)).toEqual({
      values,
      error: "Usuario, correo o contraseña incorrectos.",
    });
  });

  it("lets unexpected failures reach the error boundary", async () => {
    const { call } = fakeCall(new Error("database down"));
    await expect(attemptAuth(values, limits, allow, call)).rejects.toThrow("database down");
  });
});
