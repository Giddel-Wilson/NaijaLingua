<script lang="ts">
	import { page } from '$app/stores';
	import { 
		Home, 
		BookOpen, 
		Inbox,
		FileText,
		Users,
		BarChart3,
		Settings as SettingsIcon,
		LogOut,
		Menu,
		X,
		PlusCircle,
		User,
		Search,
		Bell
	} from 'lucide-svelte';
	import type { LayoutData } from './$types';
	
	let { data, children }: { data: LayoutData; children: any } = $props();
	
	let mobileMenuOpen = $state(false);
	
	const currentPath = $derived($page.url.pathname);
	
	const overviewItems = [
		{ href: '/dashboard', label: 'Dashboard', icon: Home }
	];
	
	const studentNavItems = [
		{ href: '/dashboard/courses', label: 'Courses', icon: BookOpen },
		{ href: '/dashboard/progress', label: 'Progress', icon: BarChart3 }
	];
	
	const instructorNavItems = [
		{ href: '/dashboard/courses', label: 'Courses', icon: BookOpen },
		{ href: '/dashboard/create-course', label: 'Create Course', icon: PlusCircle },
		{ href: '/dashboard/students', label: 'Students', icon: Users },
		{ href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 }
	];
	
	const settingsItems = [
		{ href: '/dashboard/settings', label: 'Settings', icon: SettingsIcon }
	];
	
	const mainNavItems = $derived(data.user.role === 'INSTRUCTOR' ? instructorNavItems : studentNavItems);
</script>

<div class="min-h-screen bg-gray-50">
	<div class="flex h-screen overflow-hidden">
		<!-- White & Green Sidebar with Proper Sizing -->
		<div class="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
			<div class="flex flex-col flex-grow">
				<!-- Logo Section -->
				<div class="flex items-center px-6 py-6 border-b border-gray-200">
					<div class="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
						<BookOpen class="w-6 h-6 text-white" />
					</div>
					<span class="ml-4 text-xl font-semibold text-gray-900">NaijaLingua</span>
				</div>
				
				<!-- Navigation with Proportional Spacing -->
				<div class="flex-1 px-6 py-8">
					<div class="space-y-1">
						{#each overviewItems as item}
							{@const IconComponent = item.icon}
							<a
								href={item.href}
								class="group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors {
									currentPath === item.href 
										? 'bg-green-50 text-green-700' 
										: 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
								}"
							>
								<IconComponent
									class="mr-3 h-5 w-5 {currentPath === item.href ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}" 
								/>
								{item.label}
							</a>
						{/each}
						
						{#each mainNavItems as item}
							{@const IconComponent = item.icon}
							<a
								href={item.href}
								class="group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors {
									currentPath === item.href 
										? 'bg-green-50 text-green-700' 
										: 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
								}"
							>
								<IconComponent
									class="mr-3 h-5 w-5 {currentPath === item.href ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}" 
								/>
								{item.label}
							</a>
						{/each}
						
						{#each settingsItems as item}
							{@const IconComponent = item.icon}
							<a
								href={item.href}
								class="group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors {
									currentPath === item.href 
										? 'bg-green-50 text-green-700' 
										: 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
								}"
							>
								<IconComponent
									class="mr-3 h-5 w-5 {currentPath === item.href ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}" 
								/>
								{item.label}
							</a>
						{/each}
					</div>
				</div>
				
				<!-- User Section with Proper Spacing -->
				<div class="px-6 py-4 border-t border-gray-200">
					<div class="flex items-center">
						<div class="w-10 h-10 rounded-full overflow-hidden bg-green-600 flex items-center justify-center">
							{#if data.user.profileImage}
								<img 
									src={data.user.profileImage} 
									alt={data.user.name}
									class="w-full h-full object-cover"
								/>
							{:else}
								<span class="text-white font-semibold text-sm">
									{data.user.name.charAt(0).toUpperCase()}
								</span>
							{/if}
						</div>
						<div class="ml-4 flex-1 min-w-0">
							<p class="text-sm font-semibold text-gray-900 truncate">{data.user.name}</p>
							<p class="text-xs text-gray-500 capitalize">{data.user.role.toLowerCase()}</p>
						</div>
						<form method="POST" action="/auth/logout">
							<button 
								type="submit"
								class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
								title="Logout"
							>
								<LogOut class="h-5 w-5" />
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
		
		<!-- Main Content Area -->
		<div class="lg:pl-72 flex flex-col w-0 flex-1 overflow-hidden bg-gray-50">
			<!-- Top Header with Search -->
			<div class="bg-white border-b border-gray-200 px-6 py-4">
				<div class="flex items-center justify-between">
					<!-- Mobile menu button -->
					<div class="lg:hidden">
						<button 
							onclick={() => mobileMenuOpen = !mobileMenuOpen}
							class="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100"
						>
							{#if mobileMenuOpen}
								<X class="h-6 w-6" />
							{:else}
								<Menu class="h-6 w-6" />
							{/if}
						</button>
					</div>
					
					<!-- Search Bar -->
					<div class="flex-1 max-w-lg mx-auto lg:mx-0">
						<div class="relative">
							<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<Search class="h-5 w-5 text-gray-400" />
							</div>
							<input
								type="text"
								placeholder="Search your courses..."
								class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
							/>
						</div>
					</div>
					
					<!-- Right side with notifications and user -->
					<div class="flex items-center space-x-4">
						<button class="p-2 text-gray-400 hover:text-gray-500">
							<Bell class="h-6 w-6" />
						</button>
						<div class="flex items-center">
							<div class="w-8 h-8 rounded-full overflow-hidden bg-green-600 flex items-center justify-center">
								{#if data.user.profileImage}
									<img 
										src={data.user.profileImage} 
										alt={data.user.name}
										class="w-full h-full object-cover"
									/>
								{:else}
									<span class="text-white font-semibold text-sm">
										{data.user.name.charAt(0).toUpperCase()}
									</span>
								{/if}
							</div>
							<span class="ml-2 text-sm font-medium text-gray-700 hidden sm:block">{data.user.name}</span>
						</div>
					</div>
				</div>
			</div>
			
			<!-- Mobile menu -->
			{#if mobileMenuOpen}
				<div class="lg:hidden bg-white border-b border-gray-200 shadow-lg">
					<nav class="px-4 py-3 space-y-1">
						{#each [...overviewItems, ...mainNavItems, ...settingsItems] as item}
							{@const IconComponent = item.icon}
							<a
								href={item.href}
								onclick={() => mobileMenuOpen = false}
								class="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors {
									currentPath === item.href 
										? 'bg-green-50 text-green-700' 
										: 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
								}"
							>
								<IconComponent
									class="mr-3 h-5 w-5 {currentPath === item.href ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-500'}" 
								/>
								{item.label}
							</a>
						{/each}
						
						<!-- Mobile Logout -->
						<form method="POST" action="/auth/logout" class="mt-4">
							<button 
								type="submit"
								class="w-full group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
							>
								<LogOut class="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-600" />
								Logout
							</button>
						</form>
					</nav>
				</div>
			{/if}
			
			<!-- Main Content -->
			<main class="flex-1 relative overflow-y-auto focus:outline-none">
				{@render children()}
			</main>
		</div>
	</div>
</div>
