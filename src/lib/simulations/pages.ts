// Saved simulations shown per profile page.
export const PAGE_SIZE = 12;

// The page to show for the `?page=` value: a whole number clamped between the
// first and the last page, so a stale or crafted address still lists some.
export function profilePage(requested: string | undefined, total: number) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const wanted = Number(requested);
  const page = Number.isInteger(wanted) ? Math.min(Math.max(wanted, 1), pages) : 1;
  return { page, pages, offset: (page - 1) * PAGE_SIZE };
}
