"use client";

import { ErrorState } from "@/components/feedback/error-state";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

// The session is unknown here, so the header leaves the account links out.
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <>
      <SiteHeader current="home" accountBar={<></>} accountRows={<></>} accountPill={<></>} />
      <ErrorState digest={error.digest} onRetry={retry} />
      <SiteFooter />
    </>
  );
}
