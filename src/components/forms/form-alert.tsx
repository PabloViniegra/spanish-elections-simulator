export function FormAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-sm border border-error px-4 py-3 text-caption text-error">
      {message}
    </p>
  );
}
