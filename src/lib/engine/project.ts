// Projection model: national target shares become provincial shares by
// proportional swing over a base election (P-02), raked until the national
// aggregate matches the targets (P-03). Keys are opaque: blocs, blank votes
// and "Others" are all projected the same way.

export type BaseProvince = {
  code: string;
  // Base votes per key, blank votes included; together they are the
  // province's valid votes (R-04).
  votes: ReadonlyMap<string, number>;
};

export type Projection = {
  // Share of each key in each province, by province code; rows sum to 1.
  provinces: Map<string, Map<string, number>>;
  // National share each key actually reached.
  national: Map<string, number>;
  // False when the targets cannot be met (P-05, for example a regional bloc
  // asked for more than its provinces hold), so `national` differs from them.
  converged: boolean;
};

// P-03: within 0.001 points of every target, at most 50 rounds.
export const RAKING_TOLERANCE = 0.00001;
export const RAKING_MAX_ITERATIONS = 50;

// `shares` holds the national target per key as a fraction of valid votes,
// summing to 1.
export function projectShares(base: readonly BaseProvince[], shares: ReadonlyMap<string, number>): Projection {
  const keys = [...shares.keys()];
  const targets = keys.map((key) => shares.get(key) ?? 0);
  const rowTotals = base.map(({ votes }) => sum([...votes.values()]));
  const grandTotal = sum(rowTotals);
  if (grandTotal <= 0) throw new RangeError("The base election has no valid votes");
  if (Math.abs(sum(targets) - 1) > 1e-9 || targets.some((target) => target < 0)) {
    throw new RangeError("Target shares must be non-negative and add up to 100%");
  }

  const hasBase = keys.map((key) => base.some(({ votes }) => (votes.get(key) ?? 0) > 0));
  // P-04: a key without base votes starts with the same share everywhere.
  const matrix = base.map(({ votes }, row) =>
    keys.map((key, column) => (hasBase[column] ? (votes.get(key) ?? 0) : rowTotals[row])),
  );

  // Iterative proportional fitting: scaling a column by T/S is the swing
  // (P-02), scaling a row back to its valid votes the normalisation.
  let national = columnShares(matrix, grandTotal);
  let converged = false;
  for (let iteration = 0; iteration < RAKING_MAX_ITERATIONS && !converged; iteration += 1) {
    keys.forEach((_, column) => {
      const factor = national[column] > 0 ? targets[column] / national[column] : 0;
      matrix.forEach((cells) => (cells[column] *= factor));
    });
    matrix.forEach((cells, row) => {
      const total = sum(cells);
      if (total > 0) cells.forEach((_, column) => (cells[column] *= rowTotals[row] / total));
    });
    national = columnShares(matrix, grandTotal);
    converged = national.every((share, column) => Math.abs(share - targets[column]) <= RAKING_TOLERANCE);
  }

  return {
    provinces: new Map(
      base.map(({ code }, row) => [
        code,
        new Map(keys.map((key, column) => [key, rowTotals[row] > 0 ? matrix[row][column] / rowTotals[row] : 0])),
      ]),
    ),
    national: new Map(keys.map((key, column) => [key, national[column]])),
    converged,
  };
}

function columnShares(matrix: number[][], grandTotal: number) {
  return (matrix[0] ?? []).map((_, column) => sum(matrix.map((cells) => cells[column])) / grandTotal);
}

function sum(values: readonly number[]) {
  return values.reduce((total, value) => total + value, 0);
}
