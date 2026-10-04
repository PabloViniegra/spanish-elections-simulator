import { describe, expect, it } from "vitest";
import { type SendBatch, sendLaunchEmails } from "./send-launch-emails";

const recipients = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ email: `user${i}@example.com`, name: `user${i}` }));

// Records every batch and rejects the ones whose position is listed.
function fakeResend(rejected: number[] = []) {
  const calls: { to: string[]; key: string }[] = [];
  const sendBatch: SendBatch = async (emails, { idempotencyKey }) => {
    calls.push({ to: emails.map((email) => String(email.to)), key: idempotencyKey });
    return { error: rejected.includes(calls.length - 1) ? { message: "rate limited" } : null };
  };
  return { calls, sendBatch };
}

describe("sendLaunchEmails", () => {
  it("sends in batches of 100 keyed by position", async () => {
    const { calls, sendBatch } = fakeResend();
    await sendLaunchEmails(recipients(250), "https://example.com/login", sendBatch);
    expect(calls.map(({ to }) => to.length)).toEqual([100, 100, 50]);
    expect(calls.map(({ key }) => key)).toEqual(["launch/0", "launch/100", "launch/200"]);
    expect(calls[2].to.at(-1)).toBe("user249@example.com");
  });

  it("stops at the first rejected batch", async () => {
    const { calls, sendBatch } = fakeResend([0]);
    await expect(
      sendLaunchEmails(recipients(150), "https://example.com/login", sendBatch),
    ).rejects.toThrow("launch batch at 0: rate limited");
    expect(calls).toHaveLength(1);
  });
});
