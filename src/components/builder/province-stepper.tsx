import { ProvinceLink } from "./province-link";

type Step = { code: string; name: string; href: string } | null;

type ProvinceStepperProps = {
  previous: Step;
  next: Step;
  onGo: (code: string) => void;
};

const button = "flex min-h-11 min-w-0 items-center justify-center rounded-full px-3 text-caption font-semibold sm:px-5";

// Previous and next province in INE order, the path through the wizard.
export function ProvinceStepper({ previous, next, onGo }: ProvinceStepperProps) {
  return (
    <nav aria-label="Provincia anterior y siguiente" className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
      {previous ? (
        <ProvinceLink href={previous.href} code={previous.code} onGo={onGo} className={`${button} border border-ink`}>
          <span aria-hidden>←&nbsp;</span>
          <span className="truncate">{previous.name}</span>
        </ProvinceLink>
      ) : (
        <span />
      )}
      <a href="#todas" className="inline-flex min-h-11 items-center text-caption font-semibold underline underline-offset-4">Provincias</a>
      {next && (
        <ProvinceLink href={next.href} code={next.code} onGo={onGo} className={`${button} bg-primary text-on-primary`}>
          <span className="truncate">{next.name}</span>
          <span aria-hidden>&nbsp;→</span>
        </ProvinceLink>
      )}
    </nav>
  );
}
