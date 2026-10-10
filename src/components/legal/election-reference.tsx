import { currentElection } from "@/lib/elections/current";

export function ElectionReference() {
  return (
    <>
      Reparto de escaños de referencia: {currentElection.label}, según el{" "}
      <a href={currentElection.source} className="underline underline-offset-2">{currentElection.decree}</a>.
    </>
  );
}
