const iconProps = {
  "aria-hidden": true,
  viewBox: "0 0 20 20",
  width: 18,
  height: 18,
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps} strokeWidth={1.8} className={className}>
      <path d="M8.5 11.5a3.5 3.5 0 0 0 5 0l2.5-2.5a3.5 3.5 0 0 0-5-5l-.9.9" />
      <path d="M11.5 8.5a3.5 3.5 0 0 0-5 0L4 11a3.5 3.5 0 0 0 5 5l.9-.9" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps} strokeWidth={2.2} className={className}>
      <path
        d="M4.5 10.5l3.7 3.7L15.5 6.5"
        className="[stroke-dasharray:14] [stroke-dashoffset:14] transition-[stroke-dashoffset] delay-100 duration-300 ease-snappy group-data-[copied=true]:[stroke-dashoffset:0]"
      />
    </svg>
  );
}

type ShareLinkProps = { brokenLink: boolean; longUrl: boolean; copied: boolean; onCopy: () => void };

export function ShareLink({ brokenLink, longUrl, copied, onCopy }: ShareLinkProps) {
  return (
    <div className="contents">
      {brokenLink && (
        <p role="status" className="w-full rounded-sm border border-error p-3 text-caption">
          El enlace no es válido o es de otra versión. Se muestran los resultados de 2023.
        </p>
      )}
      <p role="status" aria-live="polite" className={longUrl ? "w-full rounded-sm border border-hairline p-3 text-caption text-ink-muted-80" : "sr-only"}>
        {longUrl ? "El enlace supera los 2.000 caracteres. Algunas plataformas podrían recortarlo; comprueba que se haya compartido completo." : ""}
      </p>
      <button
        type="button"
        onClick={onCopy}
        data-copied={copied}
        className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-caption leading-none font-semibold text-on-primary transition-[background-color,scale] duration-200 ease-snappy hover:bg-primary-focus active:scale-[0.96] data-[copied=true]:bg-ink"
      >
        <span aria-hidden="true" className="relative size-[18px] flex-none">
          <LinkIcon className="absolute inset-0 transition-[opacity,scale,rotate] duration-300 ease-snappy group-data-[copied=true]:-rotate-45 group-data-[copied=true]:scale-50 group-data-[copied=true]:opacity-0 motion-reduce:transition-none" />
          <CheckIcon className="absolute inset-0 scale-50 opacity-0 transition-[opacity,scale] duration-300 ease-snappy motion-reduce:transition-none group-data-[copied=true]:scale-100 group-data-[copied=true]:opacity-100" />
        </span>
        <span className="inline-grid justify-items-center">
          <span className="col-start-1 row-start-1 transition-[opacity,translate] duration-200 ease-snappy motion-reduce:transition-none group-data-[copied=true]:-translate-y-[40%] group-data-[copied=true]:opacity-0">
            Copiar enlace
          </span>
          <span aria-hidden="true" className="col-start-1 row-start-1 -my-[0.15em] overflow-clip py-[0.15em]">
            {"Copiado".split("").map((char, index) => (
              <span
                key={index}
                style={{ transitionDelay: `${index * 30}ms` }}
                className="inline-block translate-y-[110%] rotate-[8deg] opacity-0 transition-[opacity,translate,rotate] duration-300 ease-snappy group-data-[copied=true]:translate-y-0 group-data-[copied=true]:rotate-0 group-data-[copied=true]:opacity-100 motion-reduce:transition-none"
              >
                {char}
              </span>
            ))}
          </span>
        </span>
      </button>
    </div>
  );
}
