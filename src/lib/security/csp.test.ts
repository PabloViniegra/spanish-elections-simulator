import { describe, expect, it } from "vitest";
import { contentSecurityPolicy } from "./csp";

describe("Content Security Policy", () => {
  it("authorizes scripts by nonce, not inline execution or eval, in production", () => {
    const policy = contentSecurityPolicy("test-nonce", false);
    const scripts = policy.split(";").find((directive) => directive.trim().startsWith("script-src "));
    expect(scripts).toContain("'nonce-test-nonce'");
    expect(scripts).toContain("'strict-dynamic'");
    expect(scripts).not.toContain("'unsafe-inline'");
    expect(scripts).not.toContain("'unsafe-eval'");
    expect(policy).toContain("script-src-attr 'none'");
    expect(policy).toContain("upgrade-insecure-requests");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("frame-ancestors 'none'");
  });

  it("allows the dev debugger without forcing local HTTP to HTTPS", () => {
    const policy = contentSecurityPolicy("dev-nonce", true);
    expect(policy).toContain("'unsafe-eval'");
    expect(policy).not.toContain("upgrade-insecure-requests");
  });
});
