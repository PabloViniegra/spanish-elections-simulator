"use client";

import { useState } from "react";
import { cssVar } from "@/lib/css-var";
import type { SenateCandidate } from "@/lib/senate/types";

export type RecountConstituency = { code: string; name: string; seats: number; split: string; margin: number | null; candidates: SenateCandidate[]; more: number };

const format = (n: number) => n.toLocaleString("es-ES", { useGrouping: "always" });
const control = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-focus";

export function RecountLive({
  constituencies,
  initial,
  evenSplits,
}: {
  constituencies: RecountConstituency[];
  initial: string;
  evenSplits: { code: string; name: string }[];
}) {
  const [code, setCode] = useState(initial);
  const current = constituencies.find((item) => item.code === code) ?? constituencies[0];
  const top = current.candidates[0]?.votes ?? 1;
  const cut = ((current.candidates[current.seats - 1]?.votes ?? 0) / top) * 100;

  return (
    <figure className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="grid grid-cols-2 items-center gap-2 text-caption text-ink-muted-80 sm:flex sm:flex-wrap">
          <span className="col-span-2">Quedaron 2-2:</span>
          {evenSplits.map((item) => (
            <button
              key={item.code}
              type="button"
              aria-pressed={item.code === code}
              onClick={() => setCode(item.code)}
              className={`min-h-11 rounded-full px-3 text-ink shadow-[0_0_0_1px_var(--color-hairline)] transition-[background-color,color,scale] duration-150 active:scale-[0.96] hover:bg-divider-soft aria-pressed:bg-ink aria-pressed:text-on-dark ${control}`}
            >
              {item.name.split("/")[0]}
            </button>
          ))}
        </div>
        <label className="flex min-w-0 items-center gap-3 text-caption text-ink-muted-80">
          Otra circunscripción
          <select
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className={`min-h-11 min-w-0 flex-1 rounded-sm bg-canvas px-3 py-2 text-caption text-ink shadow-[0_0_0_1px_var(--color-hairline)] sm:w-56 sm:flex-none ${control}`}
          >
            {constituencies.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p aria-live="polite" className="sr-only">
        {current.name}: {current.split}
      </p>
      <table className="w-full table-fixed border-collapse text-left">
        <caption className="pb-4 text-left text-body">
          <span className="font-semibold">
            {current.name}: {current.seats} {current.seats === 1 ? "senador" : "senadores"}.
          </span>{" "}
          <span className="text-ink-muted-80">{current.split}.</span>
          {current.margin !== null && (
            <span className="text-ink-muted-80">
              {" "}
              El último escaño se decidió por <span className="font-semibold text-ink">{format(current.margin)} {current.margin === 1 ? "voto" : "votos"}</span> sobre el primer candidato sin escaño.
            </span>
          )}
        </caption>
        <colgroup>
          <col className="w-9 sm:w-12" />
          <col />
          <col className="w-24 sm:w-36" />
        </colgroup>
        <thead className="sr-only">
          <tr>
            <th scope="col">Puesto</th>
            <th scope="col">Candidato</th>
            <th scope="col">Votos y resultado</th>
          </tr>
        </thead>
        <tbody key={current.code}>
          {current.candidates.map(({ name, party, votes, elected }, i) => (
            <tr key={name} className={`border-b border-divider-soft ${i === current.seats - 1 ? "border-b-2 border-b-ink" : ""}`}>
              <td className="py-2.5 align-top text-caption text-ink-muted-80 tabular-nums">{i + 1}.º</td>
              <th scope="row" className="py-2.5 pr-3 align-top font-normal">
                <span className="block text-caption font-semibold text-pretty sm:text-body">{name}</span>
                <span className="block truncate text-caption text-ink-muted-80">{party}</span>
                <span aria-hidden="true" className="relative mt-1.5 block h-1.5 rounded-full bg-hairline">
                  <span style={{ left: `${cut}%` }} className="absolute -top-1 -bottom-1 z-10 w-px bg-ink/60" />
                  <span
                    style={{ ...cssVar("--i", i), width: `${(votes / top) * 100}%` }}
                    className={`recount-bar block h-full rounded-full ${elected ? "bg-ink" : "bg-ink-muted-48"}`}
                  />
                </span>
              </th>
              <td className="py-2.5 text-right align-top">
                <span className="block text-caption tabular-nums">{format(votes)}</span>
                <span className={`block text-caption ${elected ? "font-semibold" : "text-ink-muted-80"}`}>{elected ? "Escaño" : "Sin escaño"}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption className="max-w-[34rem] text-caption text-pretty text-ink-muted-80">
        Resultados oficiales del 23 de julio de 2023 (Ministerio del Interior).
        {current.more > 0 && ` Se muestran los ${current.candidates.length} más votados; hubo ${current.more} candidatos más.`} La raya gruesa separa a los elegidos y la marca vertical señala los votos del último elegido.
      </figcaption>
    </figure>
  );
}
