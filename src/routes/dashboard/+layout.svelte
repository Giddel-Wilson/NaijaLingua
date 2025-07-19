<script lang="ts">
	import { page } from '$app/stores';
	import { 
		Home, 
		BookOpen, 
		Award, 
		Settings, 
		PlusCircle, 
		Users,
		BarChart3 
	} from 'lucide-svelte';
	import type { LayoutData } from './$types';
	
	let { data, children }: { data: LayoutData; children: any } = $props();
	
	$: currentPath = $page.url.pathname;
	
	const studentNavItems = [
		{ href: '/dashboard', label: 'Overview', icon: Home },
		{ href: '/dashboard/courses', label: 'My Courses', icon: BookOpen },
		{ href: '/dashboard/certificates', label: 'Certificates', icon: Award },
		{ href: '/dashboard/settings', label: 'Settings', icon: Settings }
	];
	
	const tutorNavItems = [
		{ href: '/dashboard', label: 'Overview', icon: Home },
		{ href: '/dashboard/courses', label: 'My Courses', icon: BookOpen },
		{ href: '/dashboard/create-course', label: 'Create Course', icon: PlusCircle },
		{ href: '/dashboard/students', label: 'Students', icon: Users },
		{ href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
		{ href: '/dashboard/certificates', label: 'Certificates', icon: Award },
		{ href: '/dashboard/settings', label: 'Settings', icon: Settings }
	];
	
	$: navItems = data.user.role === 'TUTOR' || data.user.role === 'ADMIN' ? tutorNavItems : studentNavItems;
</script>

<div class="min-h-screen bg-neutral">
	<div class="flex">
		<!-- Sidebar -->
		<div class="hidden lg:flex lg:w-64 lg:flex-col">
			<div class="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
				<div class="flex items-center flex-shrink-0 px-4 mb-8">
					<div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
						<BookOpen class="w-5 h-5 text-white" />
					</div>
					<span class="ml-2 text-xl font-serif font-bold text-primary">Dashboard</span>
				</div>
				<div class="mt-5 flex-grow flex flex-col">
					<nav class="flex-1 px-2 space-y-1">
						{#each navItems as item}
							<a
								href={item.href}
								class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors {
									currentPath === item.href 
										? 'bg-primary text-white' 
										: 'text-gray-700 hover:bg-gray-50 hover:text-primary'
								}"
							>
								<svelte:component 
									this={item.icon} 
									class="mr-3 h-5 w-5 {currentPath === item.href ? 'text-white' : 'text-gray-400 group-hover:text-primary'}" 
								/>
								{item.label}
							</a>
						{/each}
					</nav>
				</div>
				
				<!-- User Info -->
				<div class="flex-shrink-0 flex border-t border-gray-200 p-4">
					<div class="flex items-center">
						<div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
							<span class="text-white font-medium">
								{data.user.name.charAt(0).toUpperCase()}
							</span>
						</div>
						<div class="ml-3">
							<p class="text-sm font-medium text-gray-700">{data.user.name}</p>
							<p class="text-xs text-gray-500 capitalize">{data.user.role.toLowerCase()}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
		
		<!-- Main Content -->
		<div class="flex flex-col w-0 flex-1 overflow-hidden">
			<!-- Mobile menu button -->
			<div class="lg:hidden">
				<div class="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2">
					<div class="flex items-center">
						<div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
							<BookOpen class="w-5 h-5 text-white" />
						</div>
						<span class="ml-2 text-xl font-serif font-bold text-primary">Dashboard</span>
					</div>
				</div>
			</div>
			
			<main class="flex-1 relative overflow-y-auto focus:outline-none">
				{@render children()}
			</main>
		</div>
	</div>
</div>
