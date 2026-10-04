import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { z } from "zod";
import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";

// INE province codes: 01–50 provinces, 51 Ceuta, 52 Melilla.
const provinceCode = z.string().regex(/^(0[1-9]|[1-4]\d|5[0-2])$/);
const usageProfiles = ["citizen", "journalist", "teacher"] as const;

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
        validator: { input: z.enum(usageProfiles) },
      },
    },
  },
  plugins: [username(), nextCookies()],
});
