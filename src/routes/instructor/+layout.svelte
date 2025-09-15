<script lang="ts">
	import { page } from '$app/stores';
	import { 
		BookOpen, 
		Users, 
		BarChart3, 
		Settings, 
		Plus,
		Home,
		LogOut,
		Menu,
		X,
		DollarSign,
		TrendingUp
	} from 'lucide-svelte';
	import type { PageData } from './$types';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let sidebarOpen = false;

	const navigationItems = [
		{ href: '/instructor', icon: Home, label: 'Dashboard' },
		{ href: '/instructor/courses', icon: BookOpen, label: 'My Courses' },
		{ href: '/instructor/courses/new', icon: Plus, label: 'Create Course' },
		{ href: '/instructor/students', icon: Users, label: 'Students' },
		{ href: '/instructor/analytics', icon: BarChart3, label: 'Analytics' },
		{ href: '/instructor/settings', icon: Settings, label: 'Settings' }
	];

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	async function handleLogout() {
		try {
			const response = await fetch('/auth/logout', {
				method: 'POST'
			});
			
			if (response.ok) {
				goto('/auth/login');
			}
		} catch (error) {
			console.error('Logout error:', error);
		}
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount);
	}
</script>

<svelte:head>
	<title>Instructor Dashboard - NaijaLingua</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Mobile sidebar overlay -->
	{#if sidebarOpen}
		<div class="fixed inset-0 z-40 lg:hidden">
			<div class="fixed inset-0 bg-gray-600 bg-opacity-75" on:click={toggleSidebar}></div>
		</div>
	{/if}

	<!-- Sidebar -->
	<div class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 {sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:block">
		<div class="flex items-center justify-between h-16 px-6 bg-green-600">
			<div class="flex items-center">
				<span class="text-xl font-bold text-white">NaijaLingua</span>
				<span class="ml-2 px-2 py-1 text-xs bg-green-500 text-white rounded">Instructor</span>
			</div>
			<button on:click={toggleSidebar} class="lg:hidden text-white">
				<X class="h-6 w-6" />
			</button>
		</div>

		<!-- Stats Overview -->
		<div class="p-6 bg-gray-50 border-b">
			<div class="grid grid-cols-2 gap-4">
				<div class="text-center">
					<div class="text-2xl font-bold text-green-600">{data.stats.coursesCount}</div>
					<div class="text-xs text-gray-600">Courses</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-blue-600">{data.stats.totalStudents}</div>
					<div class="text-xs text-gray-600">Students</div>
				</div>
			</div>
		</div>

		<!-- Navigation -->
		<nav class="mt-6">
			{#each navigationItems as item}
				<a
					href={item.href}
					class="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-green-600 transition-colors duration-200 {$page.url.pathname === item.href ? 'bg-green-50 text-green-600 border-r-2 border-green-600' : ''}"
				>
					<svelte:component this={item.icon} class="h-5 w-5 mr-3" />
					{item.label}
				</a>
			{/each}
		</nav>

		<!-- User section -->
		<div class="absolute bottom-0 left-0 right-0 p-6 border-t bg-white">
			<div class="flex items-center mb-4">
				{#if data.user.profileImage}
					<img src={data.user.profileImage} alt={data.user.name} class="h-10 w-10 rounded-full" />
				{:else}
					<div class="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
						<span class="text-white font-medium">{data.user.name.charAt(0)}</span>
					</div>
				{/if}
				<div class="ml-3">
					<p class="text-sm font-medium text-gray-900">{data.user.name}</p>
					<p class="text-xs text-gray-500">{data.user.email}</p>
				</div>
			</div>
			<button
				on:click={handleLogout}
				class="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
			>
				<LogOut class="h-4 w-4 mr-2" />
				Sign out
			</button>
		</div>
	</div>

	<!-- Main content -->
	<div class="lg:ml-64">
		<!-- Top bar -->
		<div class="bg-white shadow-sm border-b lg:hidden">
			<div class="flex items-center justify-between h-16 px-4">
				<button on:click={toggleSidebar} class="text-gray-600">
					<Menu class="h-6 w-6" />
				</button>
				<span class="text-lg font-semibold text-gray-900">Instructor Dashboard</span>
				<div></div>
			</div>
		</div>

		<!-- Page content -->
		<main class="p-6">
			<slot />
		</main>
	</div>
</div>

<style>
	/* Ensure sidebar is above other content on mobile */
	.lg\:static {
		position: static;
	}

	@media (max-width: 1023px) {
		.lg\:static {
			position: fixed;
		}
	}
</style>
