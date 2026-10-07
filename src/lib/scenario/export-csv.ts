import type { Bloc } from "@/lib/elections/types";
import type { ConstituencyResult } from "@/lib/engine/types";
import { provinces } from "@/lib/provinces";

function cell(value: string) {
  const safe = /^[\s]*[=+@-]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function resultsCsv(results: readonly ConstituencyResult[], blocs: readonly Bloc[]) {
  const names = new Map(provinces.map(({ code, name }) => [code, name]));
  const rows = results.flatMap((result) => blocs.map((bloc) => {
    const candidacy = result.candidacies.find(({ id }) => id === bloc.id);
    const votes = candidacy?.votes ?? 0;
    const share = result.validVotes > 0 ? votes / result.validVotes * 100 : 0;
    return [cell(result.code), cell(names.get(result.code) ?? result.code), cell(bloc.id), cell(bloc.name), votes, share.toFixed(6), candidacy?.seats ?? 0].join(",");
  }));
  return "\uFEFF" + ["codigo_provincia,provincia,bloque_id,bloque,votos,porcentaje_voto_valido,escanos", ...rows].join("\r\n") + "\r\n";
}
