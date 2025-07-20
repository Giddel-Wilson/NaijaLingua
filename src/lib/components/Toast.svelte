<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	
	interface ToastProps {
		message: string;
		type?: 'success' | 'error' | 'info';
		duration?: number;
		onClose?: () => void;
	}
	
	let { 
		message, 
		type = 'info', 
		duration = 5000,
		onClose 
	}: ToastProps = $props();
	
	let visible = $state(true);
	
	onMount(() => {
		const timer = setTimeout(() => {
			visible = false;
			setTimeout(() => {
				onClose?.();
			}, 300); // Wait for fade out animation
		}, duration);
		
		return () => clearTimeout(timer);
	});
	
	function close() {
		visible = false;
		setTimeout(() => {
			onClose?.();
		}, 300);
	}
	
	const typeStyles = {
		success: 'bg-green-50 border-green-200 text-green-800',
		error: 'bg-red-50 border-red-200 text-red-800',
		info: 'bg-blue-50 border-blue-200 text-blue-800'
	};
	
	const iconMap = {
		success: '✅',
		error: '❌', 
		info: 'ℹ️'
	};
</script>

{#if visible}
	<div 
		class="fixed top-4 right-4 z-50 max-w-sm w-full"
		transition:fly={{ x: 300, duration: 300 }}
	>
		<div class={`${typeStyles[type]} border rounded-lg p-4 shadow-lg flex items-center justify-between`}>
			<div class="flex items-center space-x-2">
				<span class="text-lg">{iconMap[type]}</span>
				<span class="font-medium">{message}</span>
			</div>
			<button 
				onclick={close}
				class="text-gray-400 hover:text-gray-600 ml-2"
				type="button"
				aria-label="Close notification"
			>
				<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
				</svg>
			</button>
		</div>
	</div>
{/if}
