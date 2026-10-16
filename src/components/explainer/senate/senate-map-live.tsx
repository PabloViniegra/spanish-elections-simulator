"use client";

import { useState } from "react";

export type MapGroup = {
  id: "provinces" | "islands" | "cities";
  label: string;
  note: string;
  constituencies: number;
  seats: number;
  detail: { code: string; name: string; seats: number }[];
};

const senators = (n: number) => `${n} ${n === 1 ? "senador" : "senadores"}`;

export function SenateMapLive({ groups, children }: { groups: MapGroup[]; children: React.ReactNode }) {
  const [active, setActive] = useState<MapGroup["id"]>("provinces");
  const total = groups.reduce((sum, item) => sum + item.seats, 0);

  return (
    <figure className="flex flex-col gap-6">
      <div role="group" aria-label="Tipo de circunscripción" className="flex flex-wrap gap-2">
        {groups.map(({ id, label, seats }) => (
          <button
            key={id}
            type="button"
            aria-pressed={id === active}
            onClick={() => setActive(id)}
            className="min-h-11 rounded-full px-4 text-caption shadow-[0_0_0_1px_var(--color-hairline)] transition-[background-color,color,scale] duration-150 active:scale-[0.96] hover:bg-divider-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-focus aria-pressed:bg-ink aria-pressed:text-on-dark aria-pressed:shadow-none"
          >
            {label} <span className="tabular-nums opacity-80 max-sm:sr-only">· {senators(seats)}</span>
          </button>
        ))}
      </div>
      <div data-active={active} className="group/map">
        {children}
      </div>
      <div aria-live="polite" className="grid">
        {groups.map((item) => (
          <div key={item.id} className={`flex flex-col gap-3 [grid-area:1/1] ${item.id === active ? "swap-in" : "invisible"}`}>
            <p className="text-body text-pretty">
              <span className="font-semibold">
                {item.constituencies} circunscripciones, {senators(item.seats)}.
              </span>{" "}
              <span className="text-ink-muted-80">{item.note}</span>
            </p>
            {item.detail.length > 0 && (
              <ul className="grid grid-cols-2 gap-x-6 gap-y-1 text-caption sm:grid-cols-3">
                {item.detail.map(({ code, name, seats }) => (
                  <li key={code} className="flex justify-between gap-3 border-b border-divider-soft py-1.5">
                    <span>{name}</span>
                    <span className="tabular-nums text-ink-muted-80">{seats}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      <figcaption className="max-w-[34rem] text-caption text-pretty text-ink-muted-80">
        Las {groups.reduce((sum, item) => sum + item.constituencies, 0)} circunscripciones del Senado suman {total} senadores electos.
        Canarias, en el recuadro; las islas se marcan juntas por provincia.
      </figcaption>
    </figure>
  );
}
