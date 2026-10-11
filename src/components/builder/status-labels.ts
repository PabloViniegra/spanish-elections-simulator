import type { ProvinceStatus } from "@/lib/builder/types";

export const statusLabels = {
  empty: "Sin empezar",
  incomplete: "Sin votos",
  "over-census": "Supera el censo",
  "invalid-party": "Partido fuera de su territorio",
  complete: "Completa",
} satisfies Record<ProvinceStatus, string>;

// Marks in the province index, read out through the label beside them.
export const statusMarks = {
  empty: "border border-ink-muted-48",
  incomplete: "border-2 border-ink",
  "over-census": "bg-error",
  "invalid-party": "bg-error",
  complete: "bg-ink",
} satisfies Record<ProvinceStatus, string>;
