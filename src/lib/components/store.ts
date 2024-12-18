import { writable } from "svelte/store";

interface ToastNotification {
  id: number;
  type: "info" | "success" | "error" | "warning";
  dismissible: boolean;
  timeout: number;
  message: string;
}

export const toasts = writable<ToastNotification[]>([]);

interface InternalToast {
  type: "info" | "success" | "error" | "warning";
  dismissible: boolean;
  timeout: number;
  message: string;
}

const addToast = (toast: InternalToast) => {
  // Create a unique ID so we can easily find/remove it
  // if it is dismissible/has a timeout.
  const id = Math.floor(Math.random() * 10000);

  // Setup some sensible defaults for a toast.
  const defaults = {
    id,
    type: "info",
    dismissible: true,
    timeout: 3000,
  };

  // Push the toast to the top of the list of toasts
  toasts.update((all) => [{ ...defaults, ...toast }, ...all]);

  // If toast is dismissible, dismiss it after "timeout" amount of time.
  if (toast.timeout) setTimeout(() => dismissToast(id), toast.timeout);
};

export const dismissToast = (id: number) => {
  toasts.update((all) => all.filter((t) => t.id !== id));
};

export const addSuccessToast = (message: string, dismissible: boolean = false, timeout: number = 1000) => {
  addToast({
    type: "success",
    dismissible,
    timeout,
    message,
  })
}

export const addErrorToast = (message: string, dismissible: boolean = false, timeout: number = 1000) => {
  addToast({
    type: "error",
    dismissible,
    timeout,
    message,
  })
}

export const addInfoToast = (message: string, dismissible: boolean = false, timeout: number = 1000) => {
  addToast({
    type: "error",
    dismissible,
    timeout,
    message,
  })
}

