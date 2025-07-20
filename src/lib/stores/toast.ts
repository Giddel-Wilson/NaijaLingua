import { writable } from 'svelte/store';

export interface Toast {
	id: string;
	message: string;
	type: 'success' | 'error' | 'info';
	duration?: number;
}

function createToastStore() {
	const { subscribe, set, update } = writable<Toast[]>([]);
	
	return {
		subscribe,
		add: (toast: Omit<Toast, 'id'>) => {
			const id = Math.random().toString(36).substr(2, 9);
			update(toasts => [...toasts, { ...toast, id }]);
			
			// Auto remove after duration
			setTimeout(() => {
				update(toasts => toasts.filter(t => t.id !== id));
			}, toast.duration || 5000);
		},
		remove: (id: string) => {
			update(toasts => toasts.filter(t => t.id !== id));
		},
		clear: () => set([])
	};
}

export const toasts = createToastStore();
