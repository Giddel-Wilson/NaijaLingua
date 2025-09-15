<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import { setupAuthRefresh } from '$lib/session';
	import type { LayoutData } from './$types';
	
	let { data, children }: { data: LayoutData; children: any } = $props();
	
	// Check if we're on a dashboard route or admin route
	const isDashboardRoute = $derived($page.url.pathname.startsWith('/dashboard') || $page.url.pathname.startsWith('/admin'));
	
	onMount(() => {
		// Setup auth refresh to prevent unexpected logouts
		setupAuthRefresh();
	});
</script>

{#if isDashboardRoute}
	<!-- Dashboard and admin routes: standalone layout without header/footer -->
	<div class="min-h-screen">
		{@render children()}
	</div>
{:else}
	<!-- Public routes: include header and footer -->
	<div class="min-h-screen flex flex-col">
		<Header user={data.user} />
		
		<main class="flex-1">
			{@render children()}
		</main>
		
		<Footer />
	</div>
{/if}

<!-- Toast notifications (always present) -->
<ToastContainer />
