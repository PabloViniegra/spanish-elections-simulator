import { describe, expect, it } from "vitest";
import { safeNextPath, withNext } from "./next-path";

describe("safeNextPath", () => {
  it("keeps paths on this site", () => {
    expect(safeNextPath("/simulator?e=v1.abc")).toBe("/simulator?e=v1.abc");
    expect(safeNextPath("/profile")).toBe("/profile");
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
    expect(withNext("/login", "/profile")).toBe("/login?next=%2Fprofile");
    expect(withNext("/login?verified=1", "/simulator?e=v1.a")).toBe("/login?verified=1&next=%2Fsimulator%3Fe%3Dv1.a");
  });
});
