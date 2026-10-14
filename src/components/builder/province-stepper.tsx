import { ProvinceLink } from "./province-link";

type Step = { code: string; name: string; href: string } | null;

type ProvinceStepperProps = {
  previous: Step;
  next: Step;
  onGo: (code: string) => void;
};

const pill =
  "group flex min-h-12 max-w-full min-w-0 items-center gap-2 rounded-full transition-[background-color,border-color,scale] duration-150 active:scale-[0.96]";

function Chevron({ back }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={`size-4 shrink-0 fill-none stroke-current stroke-[1.75] transition-transform duration-150 ${back ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"}`}>
      <path d={back ? "M10 3.5 5.5 8l4.5 4.5" : "M6 3.5 10.5 8 6 12.5"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Label({ direction, name, muted }: { direction: string; name: string; muted: string }) {
  return (
    <span className="flex min-w-0 flex-col gap-0.5 leading-none">
      <span className={`text-fine-print ${muted}`}>{direction}</span>
      <span className="truncate text-caption font-semibold">{name}</span>
    </span>
  );
}

export function ProvinceStepper({ previous, next, onGo }: ProvinceStepperProps) {
  return (
    <nav aria-label="Provincia anterior y siguiente" className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
      <div className="flex min-w-0 justify-start">
        {previous && (
          <ProvinceLink href={previous.href} code={previous.code} onGo={onGo} className={`${pill} border border-hairline bg-canvas py-1.5 pr-4 pl-3 text-ink hover:border-ink`}>
            <Chevron back />
            <Label direction="Anterior" name={previous.name} muted="text-ink-muted-48" />
          </ProvinceLink>
        )}
      </div>
      <a href="#todas" className="flex min-h-11 items-center gap-1.5 rounded-full px-3 text-caption font-semibold text-ink-muted-80 transition-colors duration-150 hover:bg-canvas-parchment hover:text-ink">
        <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4 shrink-0 fill-current">
          <rect x="2" y="2" width="5" height="5" rx="1.25" />
          <rect x="9" y="2" width="5" height="5" rx="1.25" />
          <rect x="2" y="9" width="5" height="5" rx="1.25" />
          <rect x="9" y="9" width="5" height="5" rx="1.25" />
        </svg>
        <span className="sr-only sm:not-sr-only">Provincias</span>
      </a>
      <div className="flex min-w-0 justify-end">
        {next && (
          <ProvinceLink href={next.href} code={next.code} onGo={onGo} className={`${pill} bg-primary py-1.5 pr-3 pl-5 text-on-primary hover:bg-primary-focus`}>
            <Label direction="Siguiente" name={next.name} muted="text-on-dark-muted" />
            <Chevron />
          </ProvinceLink>
        )}
      </div>
    </nav>
  );
}
