import { Suspense } from "react";
import { getSession } from "@/lib/auth/session";
import { AccountLinks, SiteHeader, type Variant } from "./site-header";
import type { NavPage } from "./nav-link";

async function SessionAccountLinks({ current, variant }: { current: NavPage; variant: Variant }) {
  const session = await getSession();
  return <AccountLinks username={session?.user.name} current={current} variant={variant} />;
}

export function SessionSiteHeader({ current }: { current: NavPage }) {
  return (
    <SiteHeader
      current={current}
      accountBar={<Suspense fallback={<span aria-hidden="true" className="block h-11 w-60" />}><SessionAccountLinks current={current} variant="bar" /></Suspense>}
      // Holds the pill's width for anonymous users; collapses once a signed-in session resolves.
      accountPill={<Suspense fallback={<span aria-hidden="true" className="block h-11 w-28" />}><SessionAccountLinks current={current} variant="pill" /></Suspense>}
      accountRows={<Suspense fallback={<span aria-hidden="true" className="block h-24" />}><SessionAccountLinks current={current} variant="row" /></Suspense>}
    />
  );
}
