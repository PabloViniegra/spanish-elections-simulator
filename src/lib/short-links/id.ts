// 60 bits of the scenario hash: a clash is checked for, never expected.
export async function shortLinkId(scenario: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(scenario));
  return Buffer.from(digest).toString("base64url").slice(0, 10);
}
