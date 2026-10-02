// Tiny global toast (side pop-up) store. Call from any client component:
//   toast.success('Saved!'); toast.error('Something went wrong'); toast.result({ success, message });
// Rendered by <Toaster /> in the root layout.

export type ToastType = 'success' | 'error' | 'info';
export type ToastItem = { id: number; type: ToastType; message: string };

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<Listener>();
const MAX_VISIBLE = 4;

function emit() {
  listeners.forEach((l) => l(toasts));
}

export function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function show(type: ToastType, message: string) {
  if (!message) return;
  const id = nextId++;
  toasts = [...toasts, { id, type, message }].slice(-MAX_VISIBLE);
  emit();
  // Success/info disappear after 2s; errors stay a little longer so they can be read
  setTimeout(() => dismissToast(id), type === 'error' ? 5000 : 2000);
}

export const toast = {
  success: (message: string) => show('success', message),
  error: (message: string) => show('error', message),
  info: (message: string) => show('info', message),
  /** Show a { success, message } result from the API helpers as a success or error toast. */
  result: (res: { success: boolean; message: string }) => show(res.success ? 'success' : 'error', res.message),
};

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  listener(toasts);
  return () => listeners.delete(listener);
}
