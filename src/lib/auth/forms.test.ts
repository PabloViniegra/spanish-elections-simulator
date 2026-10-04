import { describe, expect, it } from "vitest";
import { authErrorMessage, fieldErrorsOf, signInSchema, signUpSchema } from "./forms";

const validSignUp = {
  username: "ana.garcia",
  email: "ana@example.com",
  password: "contraseña-segura",
  province: "28",
  usageProfile: "citizen",
};

describe("signInSchema", () => {
  it("trims the identifier", () => {
    const result = signInSchema.parse({ identifier: "  ana  ", password: "x" });
    expect(result.identifier).toBe("ana");
  });

  it("reports empty fields", () => {
    const result = signInSchema.safeParse({ identifier: " ", password: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(Object.keys(fieldErrorsOf(result.error)).sort()).toEqual(["identifier", "password"]);
    }
  });
});

describe("signUpSchema", () => {
  it("accepts a valid registration", () => {
    expect(signUpSchema.parse(validSignUp)).toEqual(validSignUp);
  });

  it("treats an empty province as not provided", () => {
    expect(signUpSchema.parse({ ...validSignUp, province: "" }).province).toBeUndefined();
  });

  it.each([
    ["username", "ab"],
    ["username", "ana garcía"],
    ["email", "ana"],
    ["password", "corta"],
    ["province", "53"],
    ["usageProfile", "admin"],
  ])("rejects an invalid %s (%s)", (field, value) => {
    const result = signUpSchema.safeParse({ ...validSignUp, [field]: value });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrorsOf(result.error)[field]).toBeTypeOf("string");
  });
});

describe("authErrorMessage", () => {
  it("translates known Better Auth codes", () => {
    expect(authErrorMessage("USERNAME_IS_ALREADY_TAKEN")).toBe(
      "Ese nombre de usuario ya está en uso.",
    );
  });

  it("falls back to a generic message", () => {
    expect(authErrorMessage(undefined)).toMatch(/Inténtalo de nuevo/);
    expect(authErrorMessage("SOMETHING_ELSE")).toMatch(/Inténtalo de nuevo/);
  });
});
