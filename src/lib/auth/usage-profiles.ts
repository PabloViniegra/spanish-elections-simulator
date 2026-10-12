// Plain data, so client forms can list them without loading zod.
export const usageProfiles = ["citizen", "journalist", "teacher"] as const;
export type UsageProfile = (typeof usageProfiles)[number];

export const usageProfileLabels = {
  citizen: "Uso personal",
  journalist: "Periodismo o análisis",
  teacher: "Docencia",
} satisfies Record<UsageProfile, string>;
