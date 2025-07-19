<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import type { LayoutData } from './$types';
	
	let { data, children }: { data: LayoutData; children: any } = $props();
</script>

<div class="min-h-screen flex flex-col">
	<Header user={data.user} />
	
	<main class="flex-1">
		{@render children()}
	</main>
	
	<Footer />
</div>
