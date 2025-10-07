<script lang="ts">
	import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-svelte';
	
	interface Props {
		isOpen: boolean;
		title?: string;
		message: string;
		type?: 'success' | 'error' | 'info' | 'warning';
		buttonText?: string;
		onClose: () => void;
	}
	
	let { 
		isOpen = $bindable(),
		title,
		message,
		type = 'info',
		buttonText = 'OK',
		onClose
	}: Props = $props();
	
	function handleClose() {
		onClose();
		isOpen = false;
	}
	
	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' || event.key === 'Enter') {
			handleClose();
		}
	}
	
	function getTypeStyles(type: string) {
		switch (type) {
			case 'success':
				return {
					icon: CheckCircle,
					iconColor: 'text-green-600',
					iconBg: 'bg-green-100',
					buttonBg: 'bg-green-600 hover:bg-green-700',
					border: 'border-green-200'
				};
			case 'error':
				return {
					icon: XCircle,
					iconColor: 'text-red-600',
					iconBg: 'bg-red-100',
					buttonBg: 'bg-red-600 hover:bg-red-700',
					border: 'border-red-200'
				};
			case 'warning':
				return {
					icon: AlertCircle,
					iconColor: 'text-amber-600',
					iconBg: 'bg-amber-100',
					buttonBg: 'bg-amber-600 hover:bg-amber-700',
					border: 'border-amber-200'
				};
			case 'info':
			default:
				return {
					icon: Info,
					iconColor: 'text-blue-600',
					iconBg: 'bg-blue-100',
					buttonBg: 'bg-blue-600 hover:bg-blue-700',
					border: 'border-blue-200'
				};
		}
	}
	
	const styles = $derived(getTypeStyles(type));
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<div 
		class="fixed inset-0 z-50 overflow-y-auto"
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-labelledby="alert-title"
	>
		<!-- Backdrop -->
		<div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
		
		<!-- Modal Content -->
		<div class="flex min-h-full items-center justify-center p-4">
			<div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all border-2 {styles.border}">
				<!-- Close button -->
				<button
					onclick={handleClose}
					class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
					aria-label="Close"
				>
					<X class="w-5 h-5" />
				</button>
				
				<!-- Icon and Content -->
				<div class="p-6">
					<div class="flex items-start space-x-4">
						<!-- Icon -->
						<div class="flex-shrink-0 w-12 h-12 rounded-full {styles.iconBg} flex items-center justify-center">
							<svelte:component this={styles.icon} class="w-6 h-6 {styles.iconColor}" />
						</div>
						
						<!-- Text Content -->
						<div class="flex-1 pt-1">
							{#if title}
								<h3 id="alert-title" class="text-lg font-semibold text-gray-900 mb-2">
									{title}
								</h3>
							{/if}
							<p class="text-gray-600 leading-relaxed">
								{message}
							</p>
						</div>
					</div>
				</div>
				
				<!-- Button -->
				<div class="px-6 pb-6 flex justify-end">
					<button
						onclick={handleClose}
						class="px-6 py-2.5 rounded-lg text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 {styles.buttonBg}"
					>
						{buttonText}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
