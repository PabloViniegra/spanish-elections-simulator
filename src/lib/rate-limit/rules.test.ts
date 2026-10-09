import { describe, expect, it } from "vitest";
import { clientIp, tooManyAttempts } from "./rules";

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
