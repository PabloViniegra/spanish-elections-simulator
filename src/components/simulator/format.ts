// Basis points to a Spanish percentage, e.g. 3306 → "33,06 %".
export const formatShare = (basisPoints: number) =>
  `${(basisPoints / 100).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\u00a0%`;

export const formatDelta = (delta: number) => (delta > 0 ? `+${delta}` : delta < 0 ? `−${-delta}` : "=");

// Votes or a D'Hondt quotient, rounded, e.g. 45230.5 → "45.231".
export const formatVotes = (votes: number) => Math.round(votes).toLocaleString("es-ES");
