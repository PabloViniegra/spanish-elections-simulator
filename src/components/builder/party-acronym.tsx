export function PartyAcronym({ acronym, name }: { acronym: string; name?: string }) {
  if (!name || name === acronym) return <span className="font-semibold">{acronym}</span>;
  return (
    <abbr title={name} className="font-semibold no-underline">
      {acronym}
    </abbr>
  );
}
