import { seats2023 } from "@/lib/seats-2023";

const compared = [
  { code: "42", name: "Soria" },
  { code: "28", name: "Madrid" },
];

// One dot per seat on a shared 13-column grid, so both constituencies are
// drawn at the same scale and the difference reads as area.
export function ConstituencyDots() {
  return (
    <div className="flex flex-col gap-8">
      {compared.map(({ code, name }) => {
        const seats = seats2023.get(code) ?? 0;
        return (
          <div key={code} className="flex flex-col gap-3">
            <p className="text-caption text-ink-muted-80">
              {name}, {seats} escaños
            </p>
            <ul aria-hidden="true" className="grid w-fit grid-cols-13 gap-1.5 sm:gap-2">
              {Array.from({ length: seats }, (_, i) => (
                <li key={i} className="size-[clamp(1rem,4.2vw,1.5rem)] rounded-full bg-ink" />
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
