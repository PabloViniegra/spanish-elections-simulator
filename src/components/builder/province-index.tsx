import type { ProvinceStatus } from "@/lib/builder/types";
import { ProvinceLink } from "./province-link";
import { statusLabels, statusMarks } from "./status-labels";

type ProvinceIndexProps = {
  provinces: readonly { code: string; name: string; status: ProvinceStatus; href: string }[];
  current: string;
  onGo: (code: string) => void;
};

// Every province with how far along it is, to jump to any of them.
export function ProvinceIndex({ provinces, current, onGo }: ProvinceIndexProps) {
  return (
    <details className="min-w-0">
      <summary className="min-h-11 cursor-pointer py-3 text-caption font-semibold">Ver las 52 provincias y su progreso</summary>
      <nav aria-label="Provincias">
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-x-4">
        {provinces.map(({ code, name, status, href }) => (
          <li key={code}>
            <ProvinceLink
              href={href}
              code={code}
              current={code === current}
              label={`${name}, ${statusLabels[status].toLowerCase()}`}
              onGo={onGo}
              className="flex min-h-11 items-center gap-3 rounded-sm px-2 text-caption hover:bg-canvas-parchment aria-[current=page]:bg-canvas-parchment aria-[current=page]:font-semibold"
            >
              <span aria-hidden className={`size-3 shrink-0 rounded-full ${statusMarks[status]}`} />
              <span className="min-w-0 truncate">{name}</span>
            </ProvinceLink>
          </li>
        ))}
      </ul>
      </nav>
    </details>
  );
}
