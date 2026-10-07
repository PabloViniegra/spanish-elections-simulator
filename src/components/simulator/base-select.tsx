import { SelectField } from "@/components/forms/select-field";

type BaseSelectProps = {
  bases: readonly { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
};

// FR-01: the election whose votes the simulation starts from. Seats stay the
// 2026 ones whatever the base.
export function BaseSelect({ bases, value, onChange }: BaseSelectProps) {
  return (
    <SelectField
      label="Votos de partida"
      hint="Los escaños por provincia son siempre los de 2026. Cambiar de elección empieza un escenario nuevo."
      value={value}
      onChange={(event) => onChange(event.target.value)}
      options={bases.map((base) => ({ value: base.id, label: `Generales de ${base.label}` }))}
    />
  );
}
