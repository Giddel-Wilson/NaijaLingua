<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	
	// Redirect to login page when accessing /auth directly
	onMount(() => {
		goto('/auth/login', { replaceState: true });
	});
</script>

<svelte:head>
	<title>Authentication - NaijaLingua</title>
</svelte:head>

<div class="min-h-screen bg-neutral flex items-center justify-center">
	<div class="text-center">
		<h2 class="text-2xl font-serif font-bold text-gray-900 mb-4">Redirecting...</h2>
		<p class="text-gray-600">Taking you to the login page</p>
	</div>
</div>
