const perks = [
  "Guarda tus simulaciones y vuelve a ellas desde tu perfil.",
  "Pon un nombre a cada escenario para encontrarlo después.",
];

// Authentication is requested only when saving a scenario.
export function SimulatorGate() {
  return (
    <aside aria-labelledby="gate-title" className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas p-5 sm:p-6">
      <h2 id="gate-title" className="text-body font-semibold">
        Una cuenta gratuita para guardar
      </h2>
      <ul className="flex flex-col gap-2 text-caption text-ink-muted-80">
        {perks.map((perk) => (
          <li key={perk} className="flex gap-2.5">
            <svg aria-hidden="true" viewBox="0 0 20 20" className="mt-0.5 size-4 shrink-0 fill-none stroke-ink stroke-[2.2]" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 10.5l3.7 3.7L15.5 6.5" />
            </svg>
            {perk}
          </li>
        ))}
      </ul>
      <p className="text-fine-print text-ink-muted-80">Simular, compartir y descargar no requiere cuenta.</p>
    </aside>
  );
}
