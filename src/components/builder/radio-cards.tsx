type RadioCardsProps<T extends string> = {
  legend: string;
  name: string;
  options: readonly { value: T; label: string; hint: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

// One choice among a few, each with a line that explains it.
export function RadioCards<T extends string>({ legend, name, options, value, onChange, className = "flex flex-col gap-3" }: RadioCardsProps<T>) {
  return (
    <fieldset className={className}>
      <legend className="mb-2 px-1 text-caption font-semibold">{legend}</legend>
      {options.map((option) => (
        <label key={option.value} className="flex cursor-pointer items-start gap-3 rounded-sm border border-ink-muted-48 px-4 py-3 transition-colors duration-150 hover:border-ink has-checked:border-ink">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="mt-1 size-4 accent-primary"
          />
          <span className="flex flex-col gap-1">
            <span className="text-body font-semibold">{option.label}</span>
            <span className="text-caption text-ink-muted-80">{option.hint}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
