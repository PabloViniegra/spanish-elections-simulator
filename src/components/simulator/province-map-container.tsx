"use client";

import { type PointerEvent, useState } from "react";
import type { ConstituencyResult } from "@/lib/engine/types";
import type { Bloc } from "@/lib/elections/types";
import { provinces } from "@/lib/provinces";
import { provinceWinners } from "@/lib/scenario/province-winners";
import { PROVINCE_INPUTS_ID } from "./province-inputs";
import { CITY_CODES, ProvinceMap } from "./province-map";
import { ProvinceSeats } from "./province-seats";
import { ProvinceTable } from "./province-table";
import { ProvinceTooltip } from "./province-tooltip";

const provinceCount = (count: number) => (count === 1 ? "1 provincia" : `${count} provincias`);

type ProvinceMapContainerProps = {
  blocs: readonly Bloc[];
  results: readonly ConstituencyResult[];
  // The shares in the sliders do not fit in 100%, so these are the last valid results.
  stale: boolean;
  // Provincial mode: the province being edited, and a tap on the map picks it.
  selected: string | null;
  lockedCodes: readonly string[];
  onPick?: (code: string) => void;
  // Takes the reader to the D'Hondt detail of a province.
  onDetail: (code: string) => void;
};

// FR-07: provinces coloured by the bloc with the most seats, ties striped,
// with the split of the one pointed at in a tooltip or tapped in a panel, a count of provinces per bloc and a
// table for every province.
export function ProvinceMapContainer({ blocs, results, stale, selected, lockedCodes, onPick, onDetail }: ProvinceMapContainerProps) {
  const [active, setActive] = useState<string | null>(null);
  // Mouse position over the map, for the tooltip; null for touch screens.
  const [cursor, setCursor] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const outcomes = provinceWinners(results);
  const blocOf = new Map(blocs.map((bloc) => [bloc.id, bloc]));
  const known = (ids: readonly string[]) => ids.flatMap((id) => blocOf.get(id) ?? []);
  const rows = provinces.map(({ code, name }) => {
    const outcome = outcomes.get(code);
    return {
      code,
      name,
      deputies: results.find((result) => result.code === code)?.seats ?? 0,
      leaders: known(outcome?.leaders ?? []),
      tied: (outcome?.leaders.length ?? 0) > 1,
      seats: (outcome?.seats ?? []).flatMap(({ id, seats }) => known([id]).map((bloc) => ({ bloc, seats }))),
    };
  });
  const ties = rows.filter((row) => row.tied).length;
  const led = blocs
    .map((bloc) => ({ bloc, count: rows.filter((row) => !row.tied && row.leaders[0]?.id === bloc.id).length }))
    .filter(({ count }) => count > 0)
    .sort((a, b) => b.count - a.count);
  // Area misleads: the province with the most deputies against the one with
  // the fewest, leaving out Ceuta and Melilla, which the map draws as dots.
  const mainland = rows.filter((row) => !CITY_CODES.has(row.code));
  const largest = mainland.reduce((most, row) => (row.deputies > most.deputies ? row : most));
  const smallest = mainland.reduce((least, row) => (row.deputies < least.deputies ? row : least));
  const summary = [...led.map(({ bloc, count }) => `${bloc.name} en ${provinceCount(count)}`), ...(ties > 0 ? [`empate en ${provinceCount(ties)}`] : [])].join(", ");
  // A mouse gets the tooltip; the panel keeps a tap, or the province edited.
  const hovered = cursor && rows.find((row) => row.code === active);
  const shown = (cursor ? null : active) ?? selected;
  const track = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    setCursor({ x: event.clientX - rect.left, y: event.clientY - rect.top, width: rect.width, height: rect.height });
  };
  // The inputs sit above the map, off-screen on a phone: bring them back.
  const edit = () => {
    const inputs = document.getElementById(PROVINCE_INPUTS_ID);
    inputs?.scrollIntoView();
    inputs?.querySelector("select")?.focus({ preventScroll: true });
  };

  return (
    <section aria-labelledby="province-map-title" className="flex flex-col gap-3">
      <h2 id="province-map-title" className="text-tagline">
        Más escaños por provincia
      </h2>
      {stale && (
        <p className="text-caption">
          <strong className="font-semibold">Último reparto válido.</strong>{" "}
          <span className="text-ink-muted-80">El mapa se actualiza cuando los porcentajes vuelven a caber en el 100 %.</span>
        </p>
      )}
      {/* Stale results lose their colour, not their contrast. */}
      <div className={`flex flex-col gap-3 ${stale ? "grayscale" : ""}`}>
        <ul aria-label="Provincias donde cada partido saca más escaños" className="flex flex-wrap gap-x-4 gap-y-1 text-caption">
          {led.map(({ bloc, count }) => (
            <li key={bloc.id} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="size-2.5 rounded-full" style={{ backgroundColor: bloc.colour }} />
              {bloc.name} <span className="text-ink-muted-80">· {provinceCount(count)}</span>
            </li>
          ))}
          {ties > 0 && (
            <li className="flex items-center gap-1.5">
              <span aria-hidden="true" className="size-2.5 rounded-full bg-[repeating-linear-gradient(45deg,var(--color-ink-muted-48)_0_1px,var(--color-canvas-parchment)_1px_3px)] ring-1 ring-ink-muted-48" />
              Empate <span className="text-ink-muted-80">· {provinceCount(ties)}</span>
            </li>
          )}
        </ul>
        <div className="relative" onPointerMove={track} onPointerLeave={() => setCursor(null)}>
          <ProvinceMap
            leaders={new Map(rows.map((row) => [row.code, row.leaders]))}
            active={active}
            selected={selected}
            lockedCodes={new Set(lockedCodes)}
            label={`Mapa del partido con más escaños en cada provincia: ${summary}.`}
            onActive={setActive}
            onPick={onPick}
            onDetail={onDetail}
          />
          {hovered && (
            <ProvinceTooltip
              province={hovered}
              {...cursor}
              hint={onPick ? (hovered.code === selected ? null : "Haz clic para editar esta provincia.") : "Haz clic para ver su reparto D’Hondt."}
            />
          )}
        </div>
        <p className="max-w-prose text-caption text-ink-muted-80">
          Las rayas finas marcan un empate en escaños. El tamaño no refleja los escaños: {largest.name} elige {largest.deputies} y {smallest.name},{" "}
          {smallest.deputies}.{lockedCodes.length > 0 && " El candado marca las provincias fijadas a mano."}
        </p>
        <ProvinceSeats
          province={rows.find((row) => row.code === shown) ?? null}
          editing={shown !== null && shown === selected}
          onEdit={edit}
          onDetail={() => shown && onDetail(shown)}
        />
        <ProvinceTable
          rows={rows}
          lockedCodes={lockedCodes}
          onEdit={
            onPick &&
            ((code) => {
              onPick(code);
              edit();
            })
          }
        />
      </div>
    </section>
  );
}
