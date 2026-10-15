"use client";

import { useState } from "react";

type List = { party: string; names: string[] };

function status(marked: string[], parties: number, limit: number) {
  if (marked.length === 0) return "Sin cruces, la papeleta contaría como voto en blanco.";
  const count = `${marked.length} de ${limit} cruces.`;
  if (marked.length === limit) return `${count} Ya no puedes marcar más: una cruz más anularía el voto.`;
  if (parties > 1) return `${count} Mezclas partidos y el voto sigue siendo válido.`;
  return `${count} Voto válido; puedes marcar ${limit - marked.length === 1 ? "uno más" : `${limit - marked.length} más`}.`;
}

export function BallotLive({ lists, limit }: { lists: List[]; limit: number }) {
  const [marked, setMarked] = useState<string[]>([]);
  const full = marked.length >= limit;
  const parties = new Set(lists.filter(({ names }) => names.some((name) => marked.includes(name))).map(({ party }) => party)).size;

  const toggle = (name: string) => setMarked((current) => (current.includes(name) ? current.filter((item) => item !== name) : [...current, name]));

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-5 rounded-xs bg-ballot-sepia p-5 shadow-product sm:p-7">
        <legend className="sr-only">Papeleta del Senado, marca hasta {limit} candidatos</legend>
        <p aria-hidden="true" className="text-fine-print font-semibold tracking-[0.08em] uppercase">
          Elecciones al Senado · Soria
        </p>
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          {lists.map(({ party, names }) => (
            <div key={party} role="group" aria-label={party} className="flex flex-col gap-1.5">
              <p aria-hidden="true" className="border-b border-ink/25 pb-1 text-caption font-semibold">
                {party}
              </p>
              {names.map((name) => {
                const checked = marked.includes(name);
                return (
                  <label key={name} className={`flex min-h-11 cursor-pointer items-center gap-3 text-caption ${!checked && full ? "cursor-not-allowed opacity-50" : ""}`}>
                    <span className="relative flex shrink-0">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!checked && full}
                        onChange={() => toggle(name)}
                        className="peer size-5 cursor-[inherit] appearance-none rounded-[2px] border-[1.5px] border-ink bg-canvas/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-focus"
                      />
                      <svg aria-hidden="true" viewBox="0 0 20 20" className="ballot-cross pointer-events-none absolute inset-0 size-5 stroke-ink">
                        <path d="M4.5 4.8 15.6 15.4" pathLength={1} />
                        <path d="M15.2 4.4 4.6 15.8" pathLength={1} />
                      </svg>
                    </span>
                    {name}
                  </label>
                );
              })}
            </div>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-body text-pretty">
          {status(marked, parties, limit)}
        </p>
        {marked.length > 0 && (
          <button
            type="button"
            onClick={() => setMarked([])}
            className="min-h-11 rounded-full px-4 text-caption shadow-[0_0_0_1px_var(--color-hairline)] transition-colors hover:bg-divider-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-focus"
          >
            Borrar cruces
          </button>
        )}
      </div>
    </div>
  );
}
