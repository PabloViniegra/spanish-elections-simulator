import { type CreateBatchOptions, Resend } from "resend";
import { LaunchEmail } from "@/emails/launch-email";
import { EMAIL_FROM } from "./sender";

// Resend accepts at most 100 emails per batch request.
const BATCH_SIZE = 100;

export type LaunchRecipient = { email: string; name: string };

export type SendBatch = (
  emails: CreateBatchOptions,
  options: { idempotencyKey: string },
) => Promise<{ error: { message: string } | null }>;

const resendBatch: SendBatch = (emails, options) =>
  new Resend(process.env.RESEND_API_KEY).batch.send(emails, options);

// Recipients must arrive in a stable order: the idempotency key of each batch
// is its position, so rerunning after a partial failure skips the batches
// Resend already accepted in the last 24 hours.
export async function sendLaunchEmails(
  recipients: LaunchRecipient[],
  url: string,
  sendBatch: SendBatch = resendBatch,
) {
  for (let start = 0; start < recipients.length; start += BATCH_SIZE) {
    const batch = recipients.slice(start, start + BATCH_SIZE).map(({ email, name }) => ({
      from: EMAIL_FROM,
      to: email,
      subject: "El simulador ya está abierto",
      react: LaunchEmail({ username: name, url }),
    }));
    const { error } = await sendBatch(batch, { idempotencyKey: `launch/${start}` });
    if (error) throw new Error(`Resend rejected launch batch at ${start}: ${error.message}`);
  }
}
