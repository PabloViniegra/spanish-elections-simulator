import { describe, expect, it } from "vitest";
import { clientIp, type Consume, firstBlocked, signInLimits, signInRules, signUpLimits, signUpRules, tooManyAttempts } from "./rules";

describe("clientIp", () => {
  it("prefers the address the proxy sets", () => {
    expect(clientIp(new Headers({ "x-real-ip": "203.0.113.7", "x-forwarded-for": "198.51.100.1" }))).toBe("203.0.113.7");
  });

  it("falls back to the first forwarded address, then to one shared bucket", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "198.51.100.1, 10.0.0.1" }))).toBe("198.51.100.1");
    expect(clientIp(new Headers({ "x-forwarded-for": "" }))).toBe("unknown");
    expect(clientIp(new Headers())).toBe("unknown");
  });
});

describe("tooManyAttempts", () => {
  it("says how many minutes to wait, rounded up", () => {
    expect(tooManyAttempts(1)).toBe("Demasiados intentos. Vuelve a probar dentro de 1 minuto.");
    expect(tooManyAttempts(61)).toBe("Demasiados intentos. Vuelve a probar dentro de 2 minutos.");
  });
});

describe("attempt limits", () => {
  it("key accounts and emails case-insensitively", () => {
    expect(signInLimits("1.2.3.4", "Ana@Example.com")).toEqual([
      ["sign-in|ip|1.2.3.4", signInRules.ip],
      ["sign-in|account|ana@example.com", signInRules.account],
    ]);
    expect(signUpLimits("1.2.3.4", "Ana@Example.com")).toEqual([
      ["sign-up|ip|1.2.3.4", signUpRules.ip],
      ["sign-up|email|ana@example.com", signUpRules.email],
    ]);
  });
});

describe("firstBlocked", () => {
  // Blocks the keys listed in `blocked` and records every key counted.
  function fakeConsume(blocked: Map<string, number>) {
    const counted: string[] = [];
    const consume: Consume = async (key) => {
      counted.push(key);
      return { retryAfter: blocked.get(key) ?? null };
    };
    return { counted, consume };
  }

  it("counts every limit and allows the attempt when none is exhausted", async () => {
    const { counted, consume } = fakeConsume(new Map());
    expect(await firstBlocked(signInLimits("ip", "ana"), consume)).toBeNull();
    expect(counted).toEqual(["sign-in|ip|ip", "sign-in|account|ana"]);
  });

  it("stops at the first exhausted limit", async () => {
    const { counted, consume } = fakeConsume(new Map([["sign-in|ip|ip", 30]]));
    expect(await firstBlocked(signInLimits("ip", "ana"), consume)).toBe(30);
    expect(counted).toEqual(["sign-in|ip|ip"]);
  });
});
