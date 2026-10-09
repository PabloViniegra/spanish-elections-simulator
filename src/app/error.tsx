"use client";

import { ErrorState } from "@/components/feedback/error-state";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorState digest={error.digest} onRetry={retry} />;
}
