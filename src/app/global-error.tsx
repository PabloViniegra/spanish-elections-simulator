"use client";

import { ErrorState } from "@/components/feedback/error-state";
import "./globals.css";

// Replaces the root layout when it fails, so it brings its own document.
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <title>Algo ha fallado</title>
        <ErrorState digest={error.digest} onRetry={retry} />
      </body>
    </html>
  );
}
