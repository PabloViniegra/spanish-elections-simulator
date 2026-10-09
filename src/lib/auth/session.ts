import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "./auth";
import { withNext } from "./next-path";

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

// The signed-in user, or a trip to the login page that comes back to `next`.
export async function requireSession(next: string) {
  const session = await getSession();
  if (!session) redirect(withNext("/login", next));
  return session;
}
