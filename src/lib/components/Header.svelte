<script lang="ts">
	import { page } from '$app/stores';
	import { goto, invalidateAll } from '$app/navigation';
	import { Menu, X, BookOpen, User, LogOut, Settings, Home } from 'lucide-svelte';
	
	let { user }: { user?: App.Locals['user'] } = $props();
	
	let mobileMenuOpen = $state(false);
	
	async function logout() {
		await fetch('/auth/logout', { method: 'POST' });
		await invalidateAll();
		goto('/');
	}
	
	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}
	
	const isHomePage = $derived($page.url.pathname === '/');
	const isCoursesPage = $derived($page.url.pathname.startsWith('/courses'));
	const isDashboardPage = $derived($page.url.pathname.startsWith('/dashboard'));
	const isAdminPage = $derived($page.url.pathname.startsWith('/admin'));
</script>

<header class="bg-white shadow-sm border-b-2 border-primary/10">
	<div class="flag-accent"></div>
	<nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between items-center h-16">
			<!-- Logo -->
			<div class="flex items-center">
				<a href="/" class="flex items-center space-x-2">
					<div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
						<BookOpen class="w-5 h-5 text-white" />
					</div>
					<span class="text-xl font-serif font-bold text-primary">NaijaLingua</span>
				</a>
			</div>
			
			<!-- Desktop Navigation -->
			<div class="hidden md:flex items-center space-x-8">
				<a 
					href="/" 
					class="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors {isHomePage ? 'text-primary bg-primary/10' : 'text-gray-700 hover:text-primary'}"
				>
					<Home class="w-4 h-4" />
					<span>Home</span>
				</a>
				
				<a 
					href="/courses" 
					class="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors {isCoursesPage ? 'text-primary bg-primary/10' : 'text-gray-700 hover:text-primary'}"
				>
					<BookOpen class="w-4 h-4" />
					<span>Courses</span>
				</a>
				
				{#if user}
					{#if user.role === 'ADMIN'}
						<a 
							href="/admin" 
							class="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors {isAdminPage ? 'text-accent bg-accent/10' : 'text-gray-700 hover:text-accent'}"
						>
							<Settings class="w-4 h-4" />
							<span>Admin</span>
						</a>
					{:else}
						<a 
							href="/dashboard" 
							class="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors {isDashboardPage ? 'text-primary bg-primary/10' : 'text-gray-700 hover:text-primary'}"
						>
							<User class="w-4 h-4" />
							<span>Dashboard</span>
						</a>
					{/if}
				{/if}
			</div>
			
			<!-- User Menu -->
			<div class="hidden md:flex items-center space-x-4">
				{#if user}
					<div class="flex items-center space-x-3">
						<!-- Profile Image -->
						<div class="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
							{#if user.profileImage}
								<img 
									src={user.profileImage} 
									alt={user.name}
									class="w-full h-full object-cover"
								/>
							{:else}
								<User class="w-4 h-4 text-gray-400" />
							{/if}
						</div>
						<span class="text-sm text-gray-700">Welcome, {user.name}</span>
						<button 
							on:click={logout}
							class="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
						>
							<LogOut class="w-4 h-4" />
							<span>Logout</span>
						</button>
					</div>
				{:else}
					<div class="flex items-center space-x-3">
						<a 
							href="/auth/login" 
							class="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
						>
							Sign In
						</a>
						<a 
							href="/auth/register" 
							class="btn-primary text-sm"
						>
							Get Started
						</a>
					</div>
				{/if}
			</div>
			
			<!-- Mobile menu button -->
			<div class="md:hidden">
				<button 
					on:click={toggleMobileMenu}
					class="p-2 rounded-md text-gray-700 hover:text-primary focus-ring"
				>
					{#if mobileMenuOpen}
						<X class="w-6 h-6" />
					{:else}
						<Menu class="w-6 h-6" />
					{/if}
				</button>
			</div>
		</div>
		
		<!-- Mobile Navigation -->
		{#if mobileMenuOpen}
			<div class="md:hidden py-4 border-t border-gray-200">
				<div class="flex flex-col space-y-2">
					<a 
						href="/" 
						class="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium {isHomePage ? 'text-primary bg-primary/10' : 'text-gray-700 hover:text-primary'}"
						on:click={() => mobileMenuOpen = false}
					>
						<Home class="w-5 h-5" />
						<span>Home</span>
					</a>
					
					<a 
						href="/courses" 
						class="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium {isCoursesPage ? 'text-primary bg-primary/10' : 'text-gray-700 hover:text-primary'}"
						on:click={() => mobileMenuOpen = false}
					>
						<BookOpen class="w-5 h-5" />
						<span>Courses</span>
					</a>
					
					{#if user}
						{#if user.role === 'ADMIN'}
							<a 
								href="/admin" 
								class="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium {isAdminPage ? 'text-accent bg-accent/10' : 'text-gray-700 hover:text-accent'}"
								on:click={() => mobileMenuOpen = false}
							>
								<Settings class="w-5 h-5" />
								<span>Admin</span>
							</a>
						{:else}
							<a 
								href="/dashboard" 
								class="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium {isDashboardPage ? 'text-primary bg-primary/10' : 'text-gray-700 hover:text-primary'}"
								on:click={() => mobileMenuOpen = false}
							>
								<User class="w-5 h-5" />
								<span>Dashboard</span>
							</a>
						{/if}
						
						<div class="border-t border-gray-200 pt-2 mt-2">
							<div class="px-3 py-2 text-sm text-gray-600">
								Signed in as {user.name}
							</div>
							<button 
								on:click={() => { logout(); mobileMenuOpen = false; }}
								class="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 w-full text-left"
							>
								<LogOut class="w-5 h-5" />
								<span>Sign Out</span>
							</button>
						</div>
					{:else}
						<div class="border-t border-gray-200 pt-2 mt-2">
							<a 
								href="/auth/login" 
								class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary"
								on:click={() => mobileMenuOpen = false}
							>
								Sign In
							</a>
							<a 
								href="/auth/register" 
								class="block px-3 py-2 text-base font-medium text-primary hover:bg-primary/10 rounded-md"
								on:click={() => mobileMenuOpen = false}
							>
								Get Started
							</a>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</nav>
</header>
