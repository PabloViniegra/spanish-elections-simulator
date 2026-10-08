import { SelectField } from "@/components/forms/select-field";

type BaseSelectProps = {
  bases: readonly { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
};

// FR-01: the election whose votes the simulation starts from. Seats stay the
// 2026 ones whatever the base, and switching can be undone from the notice.
export function BaseSelect({ bases, value, onChange }: BaseSelectProps) {
  return (
    <SelectField
      label="Votos de partida"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      options={bases.map((base) => ({ value: base.id, label: `Generales de ${base.label}` }))}
    />
  );
}
