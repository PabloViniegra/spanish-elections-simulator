import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";
import { provinceCode, usageProfile, usageProfiles } from "./user-fields";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
  user: {
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
  plugins: [username(), nextCookies()],
});
