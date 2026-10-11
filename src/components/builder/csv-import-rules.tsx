type CsvImportRulesProps = {
  // Which party columns the file may have.
  partyRule: string;
  censusYear: string;
};

// What a file must hold to be imported; nothing is guessed.
export function CsvImportRules({ partyRule, censusYear }: CsvImportRulesProps) {
  const rules = [
    "Una fila por circunscripción: las 52, una vez cada una, con su código INE de dos cifras y su nombre exactamente como en la plantilla.",
    partyRule,
    "Celda vacía: el partido no se presenta en esa provincia. 0: se presenta sin votos. Un partido del catálogo solo puede presentarse donde ya lo hizo alguna vez.",
    "Solo números enteros, sin puntos, comas ni espacios.",
    `Blancos, nulos y votos_emitidos son obligatorios. votos_emitidos debe ser la suma de partidos, blancos y nulos, y no superar el censo de ${censusYear}.`,
    "En cada provincia, al menos un partido con votos.",
    "Columnas separadas por «;» o «,», en UTF-8.",
  ];
  return (
    <ul className="flex list-disc flex-col gap-2 pl-5 text-caption">
      {rules.map((rule) => (
        <li key={rule}>{rule}</li>
      ))}
    </ul>
  );
}
