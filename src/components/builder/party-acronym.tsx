// The acronym the chamber shows, with the full name on hover and for screen readers.
export function PartyAcronym({ acronym, name }: { acronym: string; name?: string }) {
  if (!name || name === acronym) return <span className="font-semibold">{acronym}</span>;
  return (
    <abbr title={name} className="font-semibold no-underline">
      {acronym}
    </abbr>
  );
}
