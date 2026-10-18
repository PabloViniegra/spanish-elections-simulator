import type { SileoOptions } from "sileo";

// Sileo mounts its live region with the toast, which screen readers tend to skip; this one is always there.
export const STATUS_ID = "toast-status";

type Toast = Omit<SileoOptions, "description"> & { description?: string };

let markMounted = () => {};
const mounted = new Promise<void>((resolve) => (markMounted = resolve));
// Sileo (and motion) load with the first toast, and a toast fired before its toaster subscribes is lost.
export const toasterMounted = () => markMounted();

let requested = false;
const requestListeners = new Set<() => void>();
export const toasterRequested = () => requested;
export function subscribeToasterRequest(listener: () => void) {
  requestListeners.add(listener);
  return () => void requestListeners.delete(listener);
}

const toaster = () => {
  if (!requested) {
    requested = true;
    requestListeners.forEach((listener) => listener());
  }
  return mounted.then(() => import("sileo")).then(({ sileo }) => sileo);
};

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
  success: (options: Toast) => {
    announce(options);
    void toaster().then((sileo) => sileo.success(options));
  },
  error: (options: Toast) => {
    announce(options);
    void toaster().then((sileo) => sileo.error(options));
  },
  promise: <T>(promise: Promise<T>, { loading, success, error }: { loading: Toast; success: Toast; error: Toast }) =>
    toaster().then((sileo) =>
      sileo.promise(promise, {
        loading,
        success: () => (announce(success), success),
        error: () => (announce(error), error),
      }),
    ),
};
