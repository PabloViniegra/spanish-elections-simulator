import type { ComponentProps } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { CoalitionCalculator } from "@/components/simulator/coalition-calculator";
import { CoalitionCombinationsContainer } from "@/components/simulator/coalition-combinations-container";
import { DhondtDetail } from "@/components/simulator/dhondt-detail";
import { ProvinceMapContainer } from "@/components/simulator/province-map-container";
import { ResultsActions } from "@/components/simulator/results-actions";
import { ResultsOverview } from "@/components/simulator/results-overview";
import { RESULTS_ID, ResultsStrip } from "@/components/simulator/results-strip";
import { builderHref } from "@/lib/builder/address";
import type { SeatTable } from "@/lib/builder/types";
import type { Bloc } from "@/lib/elections/types";
import type { ConstituencyResult } from "@/lib/engine/types";
import { provinces } from "@/lib/provinces";
import { BuiltNationalTable } from "./built-national-table";
import { BuiltShareContainer, builtShortUrl } from "./built-share-container";

const ExportResultsContainer = dynamic(() => import("@/components/simulator/export-results-container").then((module) => module.ExportResultsContainer), { loading: () => <p role="status">Cargando descargas…</p> });

type BuiltResultsProps = {
  name: string;
  seatTable: SeatTable;
  ownerId?: string;
  ranked: readonly (Bloc & { seats: number })[];
  selected: ReadonlySet<string>;
  onToggle: (id: string) => void;
  table: ComponentProps<typeof BuiltNationalTable>;
  blocs: readonly Bloc[];
  results: readonly ConstituencyResult[];
  detail: Pick<ComponentProps<typeof DhondtDetail>, "code" | "deputies" | "detail" | "onSelect">;
  onDetail: (code: string) => void;
};

const NO_LOCKS: readonly string[] = [];

export function BuiltResults({ name, seatTable, ownerId, ranked, selected, onToggle, table, blocs, results, detail, onDetail }: BuiltResultsProps) {
  const link = () => (ownerId ? builtShortUrl(ownerId).catch(() => window.location.href) : window.location.href);
  return (
    <>
      <ResultsStrip ranked={ranked} selected={selected} />
      <div className="bg-canvas-parchment">
        <div className="mx-auto flex max-w-content flex-col gap-1 px-5 pt-10 pb-8 sm:px-8">
          {ownerId && (
            <nav aria-label="Volver" className="flex flex-wrap gap-x-6 text-caption text-ink-muted-80">
              <Link href="/profile" className="inline-flex min-h-11 items-center underline underline-offset-4">Mi perfil</Link>
              <Link href={builderHref(ownerId)} className="inline-flex min-h-11 items-center underline underline-offset-4">Editar las provincias</Link>
            </nav>
          )}
          <h1 className="text-display-lg break-words">{name}</h1>
          <p className="text-caption text-ink-muted-80">Votos introducidos a mano en las 52 provincias, con los escaños de {seatTable}.</p>
        </div>
      </div>
      <div className="mx-auto flex max-w-content flex-col gap-10 px-5 py-10 sm:px-8">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 [&>*]:min-w-0 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start lg:gap-x-16 lg:gap-y-6">
          <BuiltNationalTable {...table} />
          <div id={RESULTS_ID} className="flex flex-col gap-6 lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <ResultsOverview ranked={ranked} selected={selected} disclaimer="Son unas elecciones construidas a mano, no una previsión." legendOnWide={false} />
            <ResultsActions
              share={ownerId && <BuiltShareContainer id={ownerId} />}
              downloads={
                <ExportResultsContainer
                  results={results}
                  blocs={blocs}
                  ranked={ranked}
                  filename={`construidas-${seatTable}`}
                  subtitle={`${name}. Escaños de ${seatTable}.`}
                  link={link}
                  stale={false}
                />
              }
            />
            <CoalitionCalculator ranked={ranked} selected={selected} onToggle={onToggle}>
              <CoalitionCombinationsContainer ranked={ranked} />
            </CoalitionCalculator>
          </div>
          <div className="lg:col-start-1">
            <ProvinceMapContainer blocs={blocs} results={results} stale={false} selected={null} lockedCodes={NO_LOCKS} onDetail={onDetail} />
          </div>
        </div>
        <DhondtDetail blocs={blocs} provinces={provinces} stale={false} {...detail} />
      </div>
    </>
  );
}
