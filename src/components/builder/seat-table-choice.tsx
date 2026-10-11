import type { SeatTable } from "@/lib/builder/types";
import { RadioCards } from "./radio-cards";

const options: { value: SeatTable; label: string; hint: string }[] = [
  { value: "2023", label: "Escaños de 2023", hint: "El reparto por provincia de las elecciones de julio de 2023." },
  { value: "2026", label: "Escaños de 2026", hint: "El reparto del Real Decreto 806/2026 para noviembre de 2026." },
];

type SeatTableChoiceProps = {
  value: SeatTable;
  onChange: (value: SeatTable) => void;
};

export function SeatTableChoice({ value, onChange }: SeatTableChoiceProps) {
  return <RadioCards legend="Escaños por provincia" name="seatTable" options={options} value={value} onChange={onChange} />;
}
