import type { ComponentProps } from "react";
import Link from "next/link";
import { BuiltMap } from "./built-map";
import { IMPORT_ID } from "./csv-import";
import { CsvImportContainer } from "./csv-import-container";
import { DiscardBuilt } from "./discard-built";
import { ProvinceAllocation } from "./province-allocation";
import { ProvinceHeading } from "./province-heading";
import { ProvinceIndex } from "./province-index";
import { ProvincePartyAdder } from "./province-party-adder";
import { ProvinceToolbar } from "./province-toolbar";
import type { ProvinceStepper } from "./province-stepper";
import { ProvinceVotes } from "./province-votes";
import { SaveStatus } from "./save-status";

type BuilderWizardProps = {
  name: string;
  completed: number;
  // Once all 52 are complete and saved.
  resultsHref: string | null;
  save: ComponentProps<typeof SaveStatus>;
  discard: ComponentProps<typeof DiscardBuilt>;
  heading: ComponentProps<typeof ProvinceHeading>;
  votes: ComponentProps<typeof ProvinceVotes>;
  adder: ComponentProps<typeof ProvincePartyAdder>;
  allocation: ComponentProps<typeof ProvinceAllocation>;
  stepper: ComponentProps<typeof ProvinceStepper>;
  index: ComponentProps<typeof ProvinceIndex>;
  map: ComponentProps<typeof BuiltMap>;
  importer: ComponentProps<typeof CsvImportContainer>;
};

export function BuilderWizard({ name, completed, resultsHref, save, discard, heading, votes, adder, allocation, stepper, index, map, importer }: BuilderWizardProps) {
  return (
    <div data-builder-wizard className="pb-56 lg:pb-0">
      <div className="bg-canvas-parchment">
        <div className="mx-auto flex max-w-content flex-wrap items-end justify-between gap-x-8 gap-y-3 px-5 pt-10 pb-8 sm:px-8">
          <div className="flex min-w-0 flex-col gap-1">
            <Link href="/profile" className="inline-flex min-h-11 w-fit items-center text-caption text-ink-muted-80 underline underline-offset-4">
              Mi perfil
            </Link>
            <h1 className="text-display-lg break-words">{name}</h1>
            <p className="text-caption text-ink-muted-80">
              {completed === 52 ? "Las 52 provincias están completas." : `${completed} de 52 provincias completas.`}
            </p>
            <p className="text-caption text-ink-muted-80">Son unas elecciones construidas a mano, no una previsión.</p>
            {resultsHref && (
              <Link href={resultsHref} className="mt-2 inline-flex min-h-11 w-fit items-center rounded-full bg-primary px-6 text-caption font-semibold text-on-primary transition-[background-color,scale] duration-150 hover:bg-primary-focus active:scale-[0.96]">
                Ver el Congreso
              </Link>
            )}
            <a href={`#${IMPORT_ID}`} className="inline-flex min-h-11 w-fit items-center text-caption font-semibold underline underline-offset-2">
              Importar votos desde un CSV
            </a>
            <DiscardBuilt {...discard} />
          </div>
          <div className="hidden lg:block"><SaveStatus {...save} /></div>
        </div>
      </div>
      <div className="mx-auto grid max-w-content grid-cols-[minmax(0,1fr)] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-x-16 lg:gap-y-10 lg:py-14">
        <div className="min-w-0 lg:col-start-1"><ProvinceHeading {...heading} /></div>
        <div className="min-w-0 lg:sticky lg:top-8 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-start">
          <ProvinceAllocation {...allocation} />
        </div>
        <div className="flex min-w-0 flex-col gap-8 lg:col-start-1">
          <ProvinceVotes {...votes} />
          <ProvincePartyAdder {...adder} />
        </div>
        <ProvinceToolbar allocation={allocation} stepper={stepper} save={save} />
      </div>
      <section aria-labelledby="todas" className="scroll-mt-6 border-t border-hairline">
        <div className="mx-auto grid max-w-content grid-cols-[minmax(0,1fr)] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:py-14">
          <div className="flex flex-col gap-4">
            <h2 id="todas" className="text-tagline">
              Todas las provincias
            </h2>
            <BuiltMap {...map} />
          </div>
          <ProvinceIndex {...index} />
        </div>
      </section>
      <CsvImportContainer {...importer} />
    </div>
  );
}
