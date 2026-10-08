// Where to go after signing in: only paths on this site, so a crafted link
// cannot send the user elsewhere.
export function safeNextPath(value: string | undefined) {
  if (!value?.startsWith("/")) return "/";
  // URL parsing drops tabs and newlines and turns "\\" into "/", as browsers do.
  return new URL(value, "http://site.invalid").origin === "http://site.invalid" ? value : "/";
}

// `path` carrying `next` along, unless it is the default.
export function withNext(path: string, next: string) {
  if (next === "/") return path;
  return `${path}${path.includes("?") ? "&" : "?"}next=${encodeURIComponent(next)}`;
}

// Whether signing in is the way into the simulator, rather than a plain visit.
export const leadsToSimulator = (next: string) => next === "/simulator" || next.startsWith("/simulator?");
