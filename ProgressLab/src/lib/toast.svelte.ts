type ToastKind = 'success' | 'error' | 'info';
type Toast = { id: number; kind: ToastKind; message: string };

let nextId = 0;

export const toasts = $state<{ items: Toast[] }>({ items: [] });

export function showToast(message: string, kind: ToastKind = 'success', timeoutMs = 2200) {
	const id = ++nextId;
	toasts.items = [...toasts.items, { id, kind, message }];
	setTimeout(() => {
		toasts.items = toasts.items.filter((t) => t.id !== id);
	}, timeoutMs);
}

export function clearToasts() {
	toasts.items = [];
}
