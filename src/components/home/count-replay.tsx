"use client";

import { type ReactNode, useState } from "react";

// Remounting the subtree restarts its CSS animations, which replays the count.
// While it runs, the count can be paused (WCAG 2.2.2: it lasts over 5 s).
export function CountReplay({ children }: { children: ReactNode }) {
  const [run, setRun] = useState(0);
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);

  function handleClick() {
    if (!done) return setPaused((p) => !p);
    setRun((n) => n + 1);
    setDone(false);
    setPaused(false);
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div
        key={run}
        onAnimationEnd={(event) => {
          if (event.animationName === "count-final") setDone(true);
        }}
        className={`flex w-full justify-center ${paused ? "count-paused" : ""}`}
      >
        {children}
      </div>
      <button
        type="button"
        onClick={handleClick}
        className="min-h-11 rounded-full px-4 text-caption text-primary-on-dark transition-transform duration-150 ease-snappy active:scale-[0.97] motion-reduce:hidden"
      >
        {done ? "Volver a contar" : paused ? "Seguir contando" : "Pausar recuento"}
      </button>
    </div>
  );
}
