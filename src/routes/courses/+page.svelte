<script lang="ts">
	import { Search, Filter, Users, BookOpen, Star } from 'lucide-svelte';
	import { formatLanguage, formatLevel } from '$lib/utils';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	
	let searchQuery = $state('');
	let selectedLanguage = $state('');
	let selectedLevel = $state('');
	
	const filteredCourses = $derived(data.courses.filter(course => {
		const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
						   formatLanguage(course.language).toLowerCase().includes(searchQuery.toLowerCase());
		const matchesLanguage = !selectedLanguage || course.language === selectedLanguage;
		const matchesLevel = !selectedLevel || course.level === selectedLevel;
		
		return matchesSearch && matchesLanguage && matchesLevel;
	}));
	
	const languages = [...new Set(data.courses.map(course => course.language))];
	const levels = [...new Set(data.courses.map(course => course.level))];
	
	function getCourseGradient(language: string) {
		const gradients: Record<string, string> = {
			'YORUBA': 'from-emerald-400 to-emerald-600',
			'IGBO': 'from-blue-400 to-blue-600',
			'HAUSA': 'from-purple-400 to-purple-600',
			'EFIK': 'from-orange-400 to-orange-600',
			'TIV': 'from-red-400 to-red-600',
			'FULFULDE': 'from-pink-400 to-pink-600',
			'KANURI': 'from-indigo-400 to-indigo-600',
			'IBIBIO': 'from-cyan-400 to-cyan-600',
			'EDO': 'from-yellow-400 to-yellow-600',
			'IJAW': 'from-teal-400 to-teal-600'
		};
		return gradients[language] || 'from-gray-400 to-gray-600';
	}
</script>

<svelte:head>
	<title>Browse Courses - NaijaLingua</title>
	<meta name="description" content="Explore our comprehensive collection of Nigerian language courses. Learn Yoruba, Igbo, Hausa, and more through interactive lessons." />
</svelte:head>

<div class="bg-neutral">
	<!-- Header Section -->
	<section class="bg-primary text-white py-16">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center">
				<h1 class="text-4xl lg:text-5xl font-serif font-bold mb-4">
					Explore Nigerian Languages
				</h1>
				<p class="text-xl text-white/90 max-w-3xl mx-auto">
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
						placeholder="Search courses..."
						class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
					/>
				</div>
				
				<!-- Language Filter -->
				<div class="relative">
					<select
						bind:value={selectedLanguage}
						class="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-primary focus:border-primary"
					>
						<option value="">All Languages</option>
						{#each languages as language}
							<option value={language}>{formatLanguage(language)}</option>
						{/each}
					</select>
				</div>
				
				<!-- Level Filter -->
				<div class="relative">
					<select
						bind:value={selectedLevel}
						class="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-primary focus:border-primary"
					>
						<option value="">All Levels</option>
						{#each levels as level}
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
					{filteredCourses.length} Course{filteredCourses.length !== 1 ? 's' : ''} Available
				</h2>
				<p class="text-gray-600 mt-1">
					Start your language learning journey today
				</p>
			</div>
			
			{#if filteredCourses.length === 0}
				<div class="text-center py-12">
					<BookOpen class="w-12 h-12 text-gray-400 mx-auto mb-4" />
					<h3 class="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
					<p class="text-gray-600">Try adjusting your search criteria or filters.</p>
				</div>
			{:else}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{#each filteredCourses as course}
						<div class="card-hover group">
							<!-- Course Image/Header -->
							<div class="h-48 bg-gradient-to-br {getCourseGradient(course.language)} rounded-lg mb-6 flex items-center justify-center relative overflow-hidden">
								<span class="text-3xl font-serif text-white z-10">
									{formatLanguage(course.language)}
								</span>
								<div class="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
							</div>
							
							<!-- Course Info -->
							<div class="space-y-4">
								<div>
									<h3 class="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
										{course.title}
									</h3>
									{#if course.description}
										<p class="text-gray-600 text-sm line-clamp-2">
											{course.description}
										</p>
									{/if}
								</div>
								
								<!-- Course Meta -->
								<div class="flex items-center justify-between text-sm text-gray-500">
									<div class="flex items-center space-x-4">
										<span class="flex items-center">
											<BookOpen class="w-4 h-4 mr-1" />
											{course.lessons.length} lessons
										</span>
										<span class="flex items-center">
											<Users class="w-4 h-4 mr-1" />
											{course.enrollments.length} students
										</span>
									</div>
									<span class="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
										{formatLevel(course.level)}
									</span>
								</div>
								
								<!-- Instructor -->
								<div class="flex items-center justify-between">
									<span class="text-sm text-gray-600">
										by {course.createdBy.name}
									</span>
									<div class="flex items-center">
										{#each Array(5) as _}
											<Star class="w-4 h-4 text-gold fill-current" />
										{/each}
									</div>
								</div>
								
								<!-- Action Button -->
								<a 
									href="/courses/{course.id}" 
									class="block w-full text-center btn-primary group-hover:bg-primary/90"
								>
									View Course
								</a>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</section>
</div>
