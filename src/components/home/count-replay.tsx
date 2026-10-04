"use client";

import { type ReactNode, useState } from "react";

// Remounting the subtree restarts its CSS animations, which replays the count.
export function CountReplay({ children }: { children: ReactNode }) {
  const [run, setRun] = useState(0);
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div key={run} className="flex w-full justify-center">
        {children}
      </div>
      <button
        type="button"
        onClick={() => setRun((n) => n + 1)}
        className="min-h-11 rounded-full px-4 text-caption text-primary-on-dark transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-95 motion-reduce:hidden"
      >
        Volver a contar
      </button>
    </div>
  );
}
