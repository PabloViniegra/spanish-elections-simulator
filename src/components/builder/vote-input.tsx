type VoteInputProps = {
  id: string;
  value: number;
  label?: string;
  describedBy?: string;
  onChange: (votes: number) => void;
};

// Digits only, so pasted "12.345" counts as 12345; empty reads as no votes.
export function VoteInput({ id, value, label, describedBy, onChange }: VoteInputProps) {
  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={value === 0 ? "" : String(value)}
      placeholder="0"
      aria-label={label}
      aria-describedby={describedBy}
      onFocus={(event) => event.currentTarget.scrollIntoView({ block: "nearest" })}
      onChange={(event) => onChange(Number(event.target.value.replace(/\D/g, "")))}
      className="h-11 w-36 max-w-full shrink-0 rounded-sm border border-ink-muted-48 bg-canvas px-3 text-right text-body tabular-nums text-ink"
    />
  );
}
