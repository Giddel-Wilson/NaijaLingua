<script lang="ts">
	import ConfirmationModal from './ConfirmationModal.svelte';
	import { confirmationStore } from '$lib/stores/confirmation';

	let confirmationState = $state({ isOpen: false, options: null, resolve: null });

	confirmationStore.subscribe(state => {
		confirmationState = state;
	});

	function handleConfirm() {
		confirmationStore.handleConfirm();
	}

	function handleCancel() {
		confirmationStore.handleCancel();
	}
</script>

{#if confirmationState.isOpen && confirmationState.options}
	<ConfirmationModal
		isOpen={confirmationState.isOpen}
		title={confirmationState.options.title}
		message={confirmationState.options.message}
		confirmText={confirmationState.options.confirmText || 'Confirm'}
		cancelText={confirmationState.options.cancelText || 'Cancel'}
		variant={confirmationState.options.variant || 'warning'}
		onConfirm={handleConfirm}
		onCancel={handleCancel}
	/>
{/if}
