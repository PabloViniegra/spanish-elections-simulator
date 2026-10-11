// Where a built election is filled in, at its first or a given constituency.
export function builderHref(id: string, code?: string) {
  const path = `/builder/${encodeURIComponent(id)}`;
  return code ? `${path}?p=${code}` : path;
}

// The Congreso of a complete built election.
export function builderResultsHref(id: string) {
  return `${builderHref(id)}/results`;
}
