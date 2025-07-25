<script lang="ts">
	import { Search, Filter, Users, BookOpen, Star, Play, Plus } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { toasts } from '$lib/stores/toast';
	import type { PageData } from './$types';
	
	export let data: PageData;
	
	let searchQuery = data.searchQuery || '';
	let selectedLanguage = data.languageFilter || '';
	let selectedLevel = data.levelFilter || '';
	let enrollingCourse: string | null = null;
	
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
			'YORUBA': 'from-emerald-400 to-emerald-600',
			'IGBO': 'from-blue-400 to-blue-600',
			'HAUSA': 'from-purple-400 to-purple-600',
			'PIDGIN': 'from-orange-400 to-orange-600',
			'TIV': 'from-red-400 to-red-600',
			'FULANI': 'from-pink-400 to-pink-600',
			'KANURI': 'from-indigo-400 to-indigo-600',
			'EDO': 'from-yellow-400 to-yellow-600'
		};
		return gradients[language] || 'from-gray-400 to-gray-600';
	}

	function getLanguageFlag(language: string) {
		const flags: Record<string, string> = {
			YORUBA: '🟢',
			IGBO: '🔵', 
			HAUSA: '🟡',
			EFIK: '🟠',
			TIV: '�',
			FULFULDE: '🔴',
			KANURI: '⚪',
			IBIBIO: '🟣',
			EDO: '🟢',
			IJAW: '�'
		};
		return flags[language] || '🌍';
	}
</script>

<svelte:head>
	<title>Browse Courses - NaijaLingua</title>
	<meta name="description" content="Explore our comprehensive collection of Nigerian language courses. Learn Yoruba, Igbo, Hausa, and more through interactive lessons." />
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header Section -->
	<section class="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center">
				<h1 class="text-4xl lg:text-5xl font-bold mb-4">
					Explore Nigerian Languages
				</h1>
				<p class="text-xl text-green-100 max-w-3xl mx-auto">
					Discover the rich diversity of Nigerian languages through our carefully curated courses
				</p>
			</div>
		</div>
	</section>
	
	<!-- Filters Section -->
	<section class="bg-white border-b border-gray-200 py-6">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex flex-col md:flex-row gap-4 items-center">
				<!-- Search -->
				<div class="relative flex-1">
					<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Search class="h-5 w-5 text-gray-400" />
					</div>
					<input
						type="text"
						bind:value={searchQuery}
						on:input={handleSearchInput}
						placeholder="Search courses..."
						class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
					/>
				</div>
				
				<!-- Language Filter -->
				<div class="relative">
					<select
						bind:value={selectedLanguage}
						on:change={applyFilters}
						class="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-green-500 focus:border-transparent"
					>
						<option value="">All Languages</option>
						{#each data.languages as language}
							<option value={language}>{formatLanguage(language)}</option>
						{/each}
					</select>
				</div>
				
				<!-- Level Filter -->
				<div class="relative">
					<select
						bind:value={selectedLevel}
						on:change={applyFilters}
						class="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-green-500 focus:border-transparent"
					>
						<option value="">All Levels</option>
						{#each data.levels as level}
							<option value={level}>{formatLevel(level)}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>
	</section>
	
	<!-- Results Section -->
	<section class="py-12">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="mb-8">
				<h2 class="text-2xl font-semibold text-gray-900">
					{data.courses.length} Course{data.courses.length !== 1 ? 's' : ''} Available
				</h2>
				<p class="text-gray-600 mt-1">
					Start your language learning journey today
				</p>
			</div>
			
			{#if data.courses.length === 0}
				<div class="text-center py-12">
					<BookOpen class="w-12 h-12 text-gray-400 mx-auto mb-4" />
					<h3 class="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
					<p class="text-gray-600">Try adjusting your search criteria or filters.</p>
				</div>
			{:else}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{#each data.courses as course}
						<div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden group">
							<!-- Course Image/Header -->
							<div class="h-48 bg-gradient-to-br {getCourseGradient(course.language)} relative overflow-hidden">
								<div class="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-200"></div>
								<div class="flex items-center justify-center h-full text-white relative z-10">
									<div class="text-center">
										<span class="text-4xl block mb-2">{getLanguageFlag(course.language)}</span>
										<span class="text-xl font-bold">{formatLanguage(course.language)}</span>
									</div>
								</div>
							</div>
							
							<!-- Course Info -->
							<div class="p-6">
								<div class="mb-4">
									<h3 class="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
										{course.title}
									</h3>
									{#if course.description}
										<p class="text-gray-600 text-sm line-clamp-3">
											{course.description}
										</p>
									{:else}
										<p class="text-gray-600 text-sm">
											Learn {formatLanguage(course.language)} language from basics to advanced level.
										</p>
									{/if}
								</div>
								
								<!-- Course Meta -->
								<div class="flex items-center justify-between text-sm text-gray-500 mb-4">
									<div class="flex items-center space-x-4">
										<span class="flex items-center">
											<BookOpen class="w-4 h-4 mr-1" />
											{course._count.lessons} lessons
										</span>
										<span class="flex items-center">
											<Users class="w-4 h-4 mr-1" />
											{course._count.enrollments} students
										</span>
									</div>
									<span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
										{formatLevel(course.level)}
									</span>
								</div>
								
								<!-- Instructor -->
								<div class="flex items-center justify-between mb-6">
									<span class="text-sm text-gray-600">
										by {course.createdBy.name}
									</span>
									<div class="flex items-center">
										{#each Array(5) as _}
											<Star class="w-4 h-4 text-yellow-400 fill-current" />
										{/each}
									</div>
								</div>
								
								<!-- Action Button -->
								{#if data.userEnrollments?.some(e => e.courseId === course.id)}
									<a 
										href="/dashboard/courses" 
										class="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium"
									>
										<Play class="w-4 h-4 inline mr-2" />
										Continue Learning
									</a>
								{:else}
									<button 
										on:click={() => enrollInCourse(course.id, course.title)}
										disabled={enrollingCourse === course.id}
										class="block w-full text-center bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium"
									>
										{#if enrollingCourse === course.id}
											<div class="flex items-center justify-center">
												<svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
													<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
													<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
												</svg>
												Enrolling...
											</div>
										{:else}
											<Plus class="w-4 h-4 inline mr-2" />
											Enroll Now
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
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	
	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
