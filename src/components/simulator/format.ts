export const formatShare = (basisPoints: number) =>
  `${(basisPoints / 100).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\u00a0%`;

export const formatDelta = (delta: number) => (delta > 0 ? `+${delta}` : delta < 0 ? `−${-delta}` : "=");

export const formatVotes = (votes: number) => Math.round(votes).toLocaleString("es-ES");
