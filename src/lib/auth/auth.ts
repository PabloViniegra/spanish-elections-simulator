import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { after } from "next/server";
import { username } from "better-auth/plugins";
import { db } from "@/lib/db/client";
import { sendGoodbyeEmail } from "@/lib/email/send-goodbye-email";
import { sendResetPasswordEmail } from "@/lib/email/send-reset-password-email";
import { sendVerificationEmail } from "@/lib/email/send-verification-email";
import { consume } from "@/lib/rate-limit/store";
import * as schema from "@/lib/db/schema";
import { SITE_URL } from "@/lib/site";
import { provinceCode, usageProfile, usageProfiles } from "./user-fields";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  // Only the forms, which count per-account and per-email limits, may sign in,
  // sign up, mail someone or delete an account: over HTTP those limits would
  // be skipped. Server calls through auth.api still work, and so do the
  // emailed links (/verify-email, /reset-password/:token).
  disabledPaths: [
    "/sign-in/email",
    "/sign-in/username",
    "/sign-up/email",
    "/send-verification-email",
    "/request-password-reset",
    "/reset-password",
    "/delete-user",
    "/delete-user/callback",
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    // Whoever had the old password is signed out everywhere.
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      // Sent after the response, as unknown addresses get no email at all.
      after(() =>
        sendResetPasswordEmail(user.email, user.name, url).catch((error) => {
          console.error("Password reset email failed", error);
        }),
      );
    },
  },
  emailVerification: {
    sendOnSignIn: true,
    sendVerificationEmail: async ({ user, url }) => {
      // Sent after the response so latency does not reveal whether the account exists.
      after(() =>
        sendVerificationEmail(user.email, user.name, url).catch((error) => {
          console.error("Verification email failed", error);
        }),
      );
    },
  },
  user: {
    deleteUser: {
      enabled: true,
      // Only once the account is gone; sent after the response, like the verification email.
      afterDelete: async (user) => {
        after(() =>
          sendGoodbyeEmail(user.email, user.name, SITE_URL).catch((error) => {
            console.error("Goodbye email failed", error);
          }),
        );
      },
    },
    additionalFields: {
      province: {
        type: "string",
        required: false,
        validator: { input: provinceCode },
      },
      usageProfile: {
        type: [...usageProfiles],
        required: false,
        defaultValue: "citizen",
        // The enum type is not enforced on input, so validate it explicitly.
        validator: { input: usageProfile },
      },
    },
  },
  // In the database, as in-memory counts reset with each serverless instance.
  rateLimit: { customStorage: { consume } },
  plugins: [username(), nextCookies()],
});
