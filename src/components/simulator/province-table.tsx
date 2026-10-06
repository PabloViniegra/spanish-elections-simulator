import { Fragment } from "react";
import type { ProvinceSplitProps } from "./province-seats";

type ProvinceTableProps = {
  rows: readonly (ProvinceSplitProps["province"] & { code: string })[];
  lockedCodes: readonly string[];
  // Provincial mode: each province opens in the inputs.
  onEdit?: (code: string) => void;
};

// Text alternative to the map (NFR-05) and its keyboard route: every province
// with its seats, the leaders in bold, and in provincial mode a way to edit it.
export function ProvinceTable({ rows, lockedCodes, onEdit }: ProvinceTableProps) {
  return (
    <details className="text-caption">
      <summary className="min-h-11 cursor-pointer py-3">Ver el reparto de todas las provincias</summary>
      <table className="w-full">
        <caption className="sr-only">Escaños de cada provincia por partido; en negrita, el partido o los partidos con más escaños</caption>
        <thead className="text-left text-ink-muted-80">
          <tr className="border-b border-hairline">
            <th scope="col" className="py-1 pr-4 font-normal">Provincia</th>
            <th scope="col" className="py-1 pr-4 text-right font-normal">Escaños</th>
            <th scope="col" className="py-1 font-normal">Por partido, de más a menos</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ code, name, deputies, tied, seats }) => {
            const locked = lockedCodes.includes(code);
            const top = seats[0]?.seats;
            return (
              <tr key={code} className="border-b border-divider-soft">
                <th scope="row" className="py-1 pr-4 text-left align-top font-normal">
                  {onEdit ? (
                    <button type="button" onClick={() => onEdit(code)} className="min-h-6 text-left underline underline-offset-2">
                      <span className="sr-only">Editar el voto en </span>
                      {name}
                    </button>
                  ) : (
                    name
                  )}
                  {locked && <span className="block text-ink-muted-80">Fijada</span>}
                </th>
                <td className="py-1 pr-4 text-right align-top tabular-nums">{deputies}</td>
                <td className="py-1 align-top">
                  {tied && <span className="sr-only">Empate. </span>}
                  {seats.map(({ bloc, seats: count }, index) => (
                    <Fragment key={bloc.id}>
                      {index > 0 && " · "}
                      <span className={count === top ? "font-semibold" : undefined}>
                        {bloc.name} {count}
                      </span>
                    </Fragment>
                  ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </details>
  );
}
