import { sileo, type SileoOptions } from "sileo";

// Sileo only mounts its live region when a toast appears, and screen readers
// tend to skip a region that arrives with its text. This one is always there.
export const STATUS_ID = "toast-status";

// Descriptions are plain text, so they can be read out as they are.
type Toast = Omit<SileoOptions, "description"> & { description?: string };

function announce({ title, description }: Toast) {
  const status = document.getElementById(STATUS_ID);
  if (!status) return;
  status.textContent = "";
  const text = [title, description].filter(Boolean).join(". ");
  setTimeout(() => {
    status.textContent = text;
  }, 50);
}

export const notify = {
  success: (options: Toast) => (announce(options), sileo.success(options)),
  error: (options: Toast) => (announce(options), sileo.error(options)),
  promise: <T>(promise: Promise<T>, { loading, success, error }: { loading: Toast; success: Toast; error: Toast }) =>
    sileo.promise(promise, {
      loading,
      success: () => (announce(success), success),
      error: () => (announce(error), error),
    }),
};
