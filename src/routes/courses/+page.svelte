<script lang="ts">
	import { Search, Filter, Users, BookOpen, Star, Play, Plus, Sparkles, ArrowRight, Clock, Globe, CheckCircle, TrendingUp, X } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { toasts } from '$lib/stores/toast';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	
	let { data }: { data: PageData } = $props();
	
	let searchQuery = data.searchQuery || '';
	let selectedLanguage = data.languageFilter || '';
	let selectedLevel = data.levelFilter || '';
	let enrollingCourse: string | null = null;
	let filtersVisible = false;
	let heroAnimated = false;
	
	onMount(() => {
		setTimeout(() => heroAnimated = true, 100);
	});

	// Apply filters by navigating with search params
	function applyFilters() {
		const params = new URLSearchParams();
		if (searchQuery) params.set('search', searchQuery);
		if (selectedLanguage) params.set('language', selectedLanguage);
		if (selectedLevel) params.set('level', selectedLevel);
		
		goto(`/courses?${params.toString()}`, { replaceState: true });
	}

	// Debounced search
	let searchTimeout: NodeJS.Timeout;
	function handleSearchInput() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(applyFilters, 500);
	}

	// Clear all filters
	function clearAllFilters() {
		searchQuery = '';
		selectedLanguage = '';
		selectedLevel = '';
		applyFilters();
	}

	// Enroll in course
	async function enrollInCourse(courseId: string, courseTitle: string) {
		if (enrollingCourse) return; // Prevent double enrollment
		
		enrollingCourse = courseId;
		
		try {
			const response = await fetch('/api/enroll', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ courseId })
			});

			const result = await response.json();

			if (response.ok) {
				toasts.add({
					message: result.message,
					type: 'success'
				});
				// Redirect to dashboard after successful enrollment
				setTimeout(() => {
					goto('/dashboard/courses');
				}, 1500);
			} else {
				toasts.add({
					message: result.error || 'Failed to enroll',
					type: 'error'
				});
			}
		} catch (error) {
			toasts.add({
				message: 'Network error. Please try again.',
				type: 'error'
			});
		} finally {
			enrollingCourse = null;
		}
	}
	
	function formatLanguage(language: string) {
		return language.charAt(0) + language.slice(1).toLowerCase();
	}
	
	function formatLevel(level: string) {
		return level.charAt(0) + level.slice(1).toLowerCase();
	}
	
	function getCourseGradient(language: string) {
		const gradients: Record<string, string> = {
			'IGBO': 'from-emerald-600 via-emerald-700 to-emerald-800',
		};
		return gradients[language] || 'from-emerald-500 via-emerald-600 to-emerald-700';
	}

	function getLanguageFlag(language: string) {
		const flags: Record<string, string> = {
			// IGBO: '🔵'
		};
		return flags[language] || '🌍';
	}
	
	function getLevelColor(level: string) {
		const colors: Record<string, string> = {
			'BEGINNER': 'bg-green-100 text-green-800',
			'INTERMEDIATE': 'bg-yellow-100 text-yellow-800',
			'ADVANCED': 'bg-red-100 text-red-800'
		};
		return colors[level] || 'bg-gray-100 text-gray-800';
	}
	
	const activeFiltersCount = $derived([searchQuery, selectedLanguage, selectedLevel].filter(Boolean).length);
</script>

<svelte:head>
	<title>{data.searchQuery ? `Igbo Courses: ${data.searchQuery}` : 'Learn Igbo'} - NaijaLingua</title>
	<meta name="description" content="Master the Igbo language through our interactive courses. Learn authentic pronunciation, grammar, and cultural context with gamified lessons." />
</svelte:head>

<!-- Hero Section -->
<section class="relative bg-gradient-to-br from-white via-emerald-50 to-emerald-100 overflow-hidden">
	<!-- Background decorations -->
	<div class="absolute inset-0">
		<div class="absolute top-10 left-10 w-32 h-32 bg-emerald-200 rounded-full opacity-20 animate-pulse"></div>
		<div class="absolute top-1/2 right-20 w-24 h-24 bg-emerald-300 rounded-full opacity-30 animation-delay-500 animate-bounce"></div>
		<div class="absolute bottom-20 left-1/4 w-28 h-28 bg-emerald-200 rounded-full opacity-25 animation-delay-1000 animate-pulse"></div>
	</div>

	<div class="relative mx-auto max-w-7xl px-6 py-20 text-center">
		<div class="space-y-8" class:slideInFromBottom={heroAnimated}>
			<!-- Badge -->
			<div class="inline-flex items-center gap-2 rounded-full bg-white/60 backdrop-blur-sm px-4 py-2 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
				<Sparkles size={16} class="text-emerald-600" />
				🔵 Learn Igbo Language
			</div>

			<!-- Main heading -->
			<div class="space-y-4">
				<h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
					Master
					<span class="bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
						Igbo Language
					</span>
				</h1>
				<p class="mx-auto max-w-3xl text-lg text-gray-600 leading-relaxed">
					Discover the beauty of Igbo language through interactive lessons, cultural insights, and gamified learning experiences designed for modern learners.
				</p>
			</div>

			<!-- Quick stats -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto pt-8">
				<div class="text-center">
					<div class="text-2xl font-bold text-gray-900">{data.courses.length}</div>
					<div class="text-sm text-gray-600">Igbo Courses</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-gray-900">5k+</div>
					<div class="text-sm text-gray-600">Igbo Students</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-gray-900">98%</div>
					<div class="text-sm text-gray-600">Success Rate</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-gray-900">4.9★</div>
					<div class="text-sm text-gray-600">Rating</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Search and Filters Section -->
<section class="border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/90">
	<div class="mx-auto max-w-7xl px-6 py-6">
		<div class="flex flex-col gap-4">
			<!-- Search Bar -->
			<div class="relative max-w-xl mx-auto w-full">
				<Search class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
				<input
					bind:value={searchQuery}
					on:input={handleSearchInput}
					placeholder="Search for Igbo courses, levels, or topics..."
					class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm text-gray-900 placeholder:text-gray-500"
				/>
			</div>

			<!-- Filter Toggle and Active Filters -->
			<div class="flex items-center justify-between">
				<button
					on:click={() => filtersVisible = !filtersVisible}
					class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
				>
					<Filter size={16} />
					Filters
					{#if activeFiltersCount > 0}
						<span class="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-medium">
							{activeFiltersCount}
						</span>
					{/if}
				</button>

				{#if activeFiltersCount > 0}
					<button
						on:click={clearAllFilters}
						class="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
					>
						Clear all filters
					</button>
				{/if}
			</div>

			<!-- Expandable Filters -->
			{#if filtersVisible}
				<div class="bg-gray-50 rounded-xl p-6 space-y-4 border border-gray-200">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<!-- Language Filter -->
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Course Type</label>
							<select
								bind:value={selectedLanguage}
								on:change={applyFilters}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
							>
								<option value="">All Igbo Courses</option>
								{#each data.availableLanguages as language}
									<option value={language}>
										🔵 {formatLanguage(language)} Igbo
									</option>
								{/each}
							</select>
						</div>

						<!-- Level Filter -->
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
							<select
								bind:value={selectedLevel}
								on:change={applyFilters}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
							>
								<option value="">All Levels</option>
								{#each data.availableLevels as level}
									<option value={level}>{formatLevel(level)}</option>
								{/each}
							</select>
						</div>
					</div>
				</div>
			{/if}

			<!-- Active Filter Tags -->
			{#if activeFiltersCount > 0}
				<div class="flex flex-wrap gap-2">
					{#if searchQuery}
						<span class="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
							Search: "{searchQuery}"
							<button on:click={() => {searchQuery = ''; applyFilters()}} class="hover:bg-emerald-200 rounded-full p-0.5">
								<X size={12} />
							</button>
						</span>
					{/if}
					{#if selectedLanguage}
						<span class="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
							{getLanguageFlag(selectedLanguage)} {formatLanguage(selectedLanguage)}
							<button on:click={() => {selectedLanguage = ''; applyFilters()}} class="hover:bg-emerald-200 rounded-full p-0.5">
								<X size={12} />
							</button>
						</span>
					{/if}
					{#if selectedLevel}
						<span class="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
							{formatLevel(selectedLevel)}
							<button on:click={() => {selectedLevel = ''; applyFilters()}} class="hover:bg-emerald-200 rounded-full p-0.5">
								<X size={12} />
							</button>
						</span>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</section>

<!-- Courses Grid -->
<section class="py-16 bg-gray-50">
	<div class="mx-auto max-w-7xl px-6">
		{#if data.courses.length === 0}
			<!-- Empty State -->
			<div class="text-center py-16">
				<div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
					<BookOpen size={32} class="text-gray-400" />
				</div>
				<h3 class="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
				<p class="text-gray-600 mb-6 max-w-sm mx-auto">
					We couldn't find any Igbo courses matching your criteria. Try adjusting your filters.
				</p>
				<button
					on:click={clearAllFilters}
					class="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
				>
					<Search size={16} />
					View All Igbo Courses
				</button>
			</div>
		{:else}
			<!-- Results Header -->
			<div class="flex items-center justify-between mb-8">
				<div>
					<h2 class="text-2xl font-bold text-gray-900">
						{#if searchQuery || selectedLanguage || selectedLevel}
							Search Results
						{:else}
							All Courses
						{/if}
					</h2>
					<p class="text-gray-600 mt-1">
						{data.courses.length} Igbo course{data.courses.length === 1 ? '' : 's'} available
					</p>
				</div>

				<!-- Sort Options (placeholder for future feature) -->
				<div class="hidden md:flex items-center gap-2 text-sm text-gray-600">
					<span>Sort by:</span>
					<select class="border-0 bg-transparent focus:ring-0 font-medium text-gray-900">
						<option>Popularity</option>
						<option>Newest</option>
						<option>Difficulty</option>
					</select>
				</div>
			</div>

			<!-- Courses Grid -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{#each data.courses as course, index}
					<div class="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300" 
						 style="animation-delay: {index * 100}ms">
						<!-- Course Header with Gradient -->
						<div class="relative h-40 bg-gradient-to-br {getCourseGradient(course.language)} overflow-hidden">
							<!-- Background Pattern -->
							<div class="absolute inset-0 opacity-10">
								<div class="absolute top-4 left-4 w-16 h-16 border-2 border-white rounded-full"></div>
								<div class="absolute bottom-4 right-4 w-12 h-12 border-2 border-white rounded-full"></div>
								<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-white rounded-full"></div>
							</div>
							
							<div class="relative p-6 h-full flex flex-col justify-between text-white">
								<div class="flex items-center justify-between">
									<span class="text-3xl">{getLanguageFlag(course.language)}</span>
									<span class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
										{formatLevel(course.level)}
									</span>
								</div>
								<div>
									<h3 class="text-xl font-bold mb-1">{course.title}</h3>
									<p class="text-white/90 text-sm font-medium">{formatLanguage(course.language)}</p>
								</div>
							</div>
						</div>

						<!-- Course Content -->
						<div class="p-6 space-y-4">
							<!-- Description -->
							{#if course.description}
								<p class="text-gray-600 text-sm leading-relaxed line-clamp-2">
									{course.description}
								</p>
							{/if}

							<!-- Course Stats -->
							<div class="flex items-center gap-4 text-sm text-gray-500">
								<div class="flex items-center gap-1">
									<BookOpen size={14} />
									<span>{course.lessons?.length || 0} lessons</span>
								</div>
								<div class="flex items-center gap-1">
									<Users size={14} />
									<span>{course.enrollments?.length || 0} students</span>
								</div>
								<div class="flex items-center gap-1">
									<Clock size={14} />
									<span>~2 hours</span>
								</div>
							</div>

							<!-- Features/Highlights -->
							<div class="flex flex-wrap gap-2">
								<span class="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
									Interactive
								</span>
								<span class="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
									Audio Lessons
								</span>
								<span class="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
									Cultural Context
								</span>
							</div>

							<!-- Enrollment Status or Action -->
							{#if course.isEnrolled}
								<div class="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
									<CheckCircle size={18} class="text-green-600" />
									<span class="text-sm font-medium text-green-700">Enrolled</span>
									<a 
										href="/dashboard/courses/{course.id}"
										class="ml-auto inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700"
									>
										Continue <ArrowRight size={14} />
									</a>
								</div>
							{:else}
								<button
									on:click={() => enrollInCourse(course.id, course.title)}
									disabled={enrollingCourse === course.id}
									class="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium py-3 px-4 rounded-xl 
										   hover:from-emerald-700 hover:to-emerald-800 
										   disabled:opacity-50 disabled:cursor-not-allowed
										   transition-all duration-200 flex items-center justify-center gap-2
										   group-hover:shadow-lg"
								>
									{#if enrollingCourse === course.id}
										<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
										Enrolling...
									{:else}
										<Play size={16} />
										Start Learning
									{/if}
								</button>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>

<!-- CTA Section -->
<section class="bg-primary border-b-2 border-green-800 text-white">
	<div class="mx-auto max-w-7xl px-6 py-16">
		<div class="text-center space-y-8">
			<div class="space-y-4">
				<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
					Ready to Start Your Igbo Journey?
				</h2>
				<p class="mx-auto max-w-2xl text-lg text-emerald-50">
					Join thousands of learners discovering the beauty of Igbo language and culture through our interactive platform.
				</p>
			</div>

			<div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
				<a 
					href="/register"
					class="inline-flex items-center gap-2 bg-white text-emerald-700 font-semibold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors shadow-lg"
				>
					<Sparkles size={20} />
					Get Started Free
				</a>
				<a 
					href="/about"
					class="inline-flex items-center gap-2 text-white border-2 border-white/30 font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors"
				>
					<Globe size={20} />
					Learn More
				</a>
			</div>

			<!-- Trust indicators -->
			<div class="pt-8 border-t border-white/20">
				<div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
					<div>
						<div class="text-2xl font-bold text-white">5k+</div>
						<div class="text-sm text-emerald-200">Igbo Students</div>
					</div>
					<div>
						<div class="text-2xl font-bold text-white">25k+</div>
						<div class="text-sm text-emerald-200">Lessons Completed</div>
					</div>
					<div>
						<div class="text-2xl font-bold text-white">98%</div>
						<div class="text-sm text-emerald-200">Completion Rate</div>
					</div>
					<div>
						<div class="text-2xl font-bold text-white">4.9★</div>
						<div class="text-sm text-emerald-200">Average Rating</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.slideInFromBottom {
		animation: slideInFromBottom 0.8s ease-out forwards;
	}
	
	@keyframes slideInFromBottom {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	.animation-delay-500 {
		animation-delay: 0.5s;
	}
	
	.animation-delay-1000 {
		animation-delay: 1s;
	}
	
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>