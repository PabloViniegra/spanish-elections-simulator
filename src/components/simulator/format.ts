// Basis points to a Spanish percentage, e.g. 3306 → "33,06 %".
export const formatShare = (basisPoints: number) =>
  `${(basisPoints / 100).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`;

export const formatDelta = (delta: number) => (delta > 0 ? `+${delta}` : delta < 0 ? `−${-delta}` : "=");
