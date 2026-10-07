import { describe, expect, it } from "vitest";
import { safeNextPath, withNext } from "./next-path";

describe("safeNextPath", () => {
  it("keeps paths on this site", () => {
    expect(safeNextPath("/simulador?e=v1.abc")).toBe("/simulador?e=v1.abc");
    expect(safeNextPath("/perfil")).toBe("/perfil");
  });

  it("falls back for anything else", () => {
    for (const value of [undefined, "", "https://evil.example", "//evil.example", "/\\evil.example", "/\t/evil.example", "/\n/evil.example", "perfil"]) {
      expect(safeNextPath(value)).toBe("/");
    }
  });
});

describe("withNext", () => {
  it("adds next to the query unless it is the home page", () => {
    expect(withNext("/login", "/")).toBe("/login");
    expect(withNext("/login", "/perfil")).toBe("/login?next=%2Fperfil");
    expect(withNext("/login?verified=1", "/simulador?e=v1.a")).toBe("/login?verified=1&next=%2Fsimulador%3Fe%3Dv1.a");
  });
});
