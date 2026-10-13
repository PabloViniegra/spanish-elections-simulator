// For failures nobody expected (e.g. a database outage): logged for the server
// and told in the form, so the page stays and what the user typed is kept.
export const SERVER_ERROR = "Ha habido un problema en el servidor. Inténtalo de nuevo en unos minutos.";

export function serverFailure(error: Error) {
  console.error(error);
  return { error: SERVER_ERROR };
}
