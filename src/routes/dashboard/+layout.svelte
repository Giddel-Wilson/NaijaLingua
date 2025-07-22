<script lang="ts">
	import { page } from '$app/stores';
	import { 
		Home, 
		BookOpen, 
		Award, 
		Settings, 
		PlusCircle, 
		Users,
		BarChart3,
		LogOut,
		Menu,
		X
	} from 'lucide-svelte';
	import type { LayoutData } from './$types';
	
	let { data, children }: { data: LayoutData; children: any } = $props();
	
	let mobileMenuOpen = $state(false);
	
	const currentPath = $derived($page.url.pathname);
	
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
	
	const navItems = $derived(data.user.role === 'TUTOR' || data.user.role === 'ADMIN' ? tutorNavItems : studentNavItems);
</script>

<div class="min-h-screen bg-gray-50">
	<div class="flex h-screen overflow-hidden">
		<!-- Sidebar -->
		<div class="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
			<div class="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
				<div class="flex items-center flex-shrink-0 px-6 py-6 border-b border-gray-200">
					<div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
						<BookOpen class="w-5 h-5 text-white" />
					</div>
					<span class="ml-3 text-xl font-serif font-bold text-primary">NaijaLingua</span>
				</div>
				<div class="mt-6 flex-grow flex flex-col">
					<nav class="flex-1 px-4 space-y-2">
						{#each navItems as item}
							{@const IconComponent = item.icon}
							<a
								href={item.href}
								class="group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors {
									currentPath === item.href 
										? 'bg-primary text-white shadow-sm' 
										: 'text-gray-700 hover:bg-primary/5 hover:text-primary'
								}"
							>
								<IconComponent
									class="mr-3 h-5 w-5 {currentPath === item.href ? 'text-white' : 'text-gray-400 group-hover:text-primary'}" 
								/>
								{item.label}
							</a>
						{/each}
					</nav>
				</div>
				
				<!-- User Info and Logout -->
				<div class="flex-shrink-0 border-t border-gray-200 p-4 space-y-3">
					<!-- User Info -->
					<div class="flex items-center">
						<div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
							<span class="text-white font-semibold text-lg">
								{data.user.name.charAt(0).toUpperCase()}
							</span>
						</div>
						<div class="ml-3 flex-1 min-w-0">
							<p class="text-sm font-semibold text-gray-900 truncate">{data.user.name}</p>
							<p class="text-xs text-gray-500 capitalize">{data.user.role.toLowerCase()}</p>
						</div>
					</div>
					
					<!-- Logout Button -->
					<form method="POST" action="/auth/logout" class="w-full">
						<button 
							type="submit"
							class="w-full group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
						>
							<LogOut class="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-600" />
							Sign Out
						</button>
					</form>
				</div>
			</div>
		</div>
		
		<!-- Main Content -->
		<div class="lg:pl-64 flex flex-col w-0 flex-1 overflow-hidden">
			<!-- Mobile menu button -->
			<div class="lg:hidden">
				<div class="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
					<div class="flex items-center">
						<div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
							<BookOpen class="w-5 h-5 text-white" />
						</div>
						<span class="ml-2 text-xl font-serif font-bold text-primary">NaijaLingua</span>
					</div>
					<button 
						onclick={() => mobileMenuOpen = !mobileMenuOpen}
						class="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
					>
						{#if mobileMenuOpen}
							<X class="h-6 w-6" />
						{:else}
							<Menu class="h-6 w-6" />
						{/if}
					</button>
				</div>
				
				<!-- Mobile menu -->
				{#if mobileMenuOpen}
					<div class="bg-white border-b border-gray-200 shadow-lg">
						<nav class="px-4 py-3 space-y-2">
							{#each navItems as item}
								{@const IconComponent = item.icon}
								<a
									href={item.href}
									onclick={() => mobileMenuOpen = false}
									class="group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors {
										currentPath === item.href 
											? 'bg-primary text-white shadow-sm' 
											: 'text-gray-700 hover:bg-primary/5 hover:text-primary'
									}"
								>
									<IconComponent
										class="mr-3 h-5 w-5 {currentPath === item.href ? 'text-white' : 'text-gray-400 group-hover:text-primary'}" 
									/>
									{item.label}
								</a>
							{/each}
							
							<!-- Mobile Logout -->
							<form method="POST" action="/auth/logout" class="w-full">
								<button 
									type="submit"
									class="w-full group flex items-center px-3 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
								>
									<LogOut class="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-600" />
									Sign Out
								</button>
							</form>
						</nav>
						
						<!-- Mobile User Info -->
						<div class="border-t border-gray-200 p-4">
							<div class="flex items-center">
								<div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
									<span class="text-white font-semibold text-lg">
										{data.user.name.charAt(0).toUpperCase()}
									</span>
								</div>
								<div class="ml-3 flex-1 min-w-0">
									<p class="text-sm font-semibold text-gray-900 truncate">{data.user.name}</p>
									<p class="text-xs text-gray-500 capitalize">{data.user.role.toLowerCase()}</p>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>
			
			<main class="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50">
				<div class="max-w-7xl mx-auto">
					{@render children()}
				</div>
			</main>
		</div>
	</div>
</div>
