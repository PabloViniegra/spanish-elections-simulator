import { z } from "zod";

// INE province codes: 01–50 provinces, 51 Ceuta, 52 Melilla.
export const provinceCode = z.string().regex(/^(0[1-9]|[1-4]\d|5[0-2])$/);
export const usageProfiles = ["citizen", "journalist", "teacher"] as const;
export const usageProfile = z.enum(usageProfiles);

export const usageProfileLabels = {
  citizen: "Uso personal",
  journalist: "Periodismo o análisis",
  teacher: "Docencia",
} satisfies Record<z.infer<typeof usageProfile>, string>;
