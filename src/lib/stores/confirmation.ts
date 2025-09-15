import { writable } from 'svelte/store';

export interface ConfirmationOptions {
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	variant?: 'danger' | 'warning' | 'info';
}

interface ConfirmationState {
	isOpen: boolean;
	options: ConfirmationOptions | null;
	resolve: ((value: boolean) => void) | null;
}

function createConfirmationStore() {
	const { subscribe, set, update } = writable<ConfirmationState>({
		isOpen: false,
		options: null,
		resolve: null
	});

	return {
		subscribe,
		confirm: (options: ConfirmationOptions): Promise<boolean> => {
			return new Promise((resolve) => {
				set({
					isOpen: true,
					options,
					resolve
				});
			});
		},
		handleConfirm: () => {
			update(state => {
				if (state.resolve) {
					state.resolve(true);
				}
				return {
					isOpen: false,
					options: null,
					resolve: null
				};
			});
		},
		handleCancel: () => {
			update(state => {
				if (state.resolve) {
					state.resolve(false);
				}
				return {
					isOpen: false,
					options: null,
					resolve: null
				};
			});
		}
	};
}

export const confirmationStore = createConfirmationStore();

// Helper function for easy use
export async function confirm(options: ConfirmationOptions): Promise<boolean> {
	return confirmationStore.confirm(options);
}
