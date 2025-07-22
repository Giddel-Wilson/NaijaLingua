<script lang="ts">
	import { BookOpen, Clock, Users, Award, Play, CheckCircle } from 'lucide-svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function getLevelColor(level: string) {
		switch (level) {
			case 'BEGINNER':
				return 'bg-green-100 text-green-800';
			case 'INTERMEDIATE':
				return 'bg-yellow-100 text-yellow-800';
			case 'ADVANCED':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	function getLanguageFlag(language: string) {
		const flags: Record<string, string> = {
			YORUBA: '🟢',
			IGBO: '🔵',
			HAUSA: '🟡',
			PIDGIN: '🟠',
			EDO: '🟣',
			FULANI: '🔴',
			KANURI: '⚪',
			TIV: '🟤'
		};
		return flags[language] || '🌍';
	}
</script>

<svelte:head>
	<title>My Courses - NaijaLingua</title>
</svelte:head>

<div class="p-6">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
		<p class="text-gray-600">
			Track your progress and continue learning Nigerian languages
		</p>
	</div>

	<!-- Stats Overview -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
		<div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-green-100 text-sm">Enrolled Courses</p>
					<p class="text-2xl font-bold">{data.enrolledCourses.length}</p>
				</div>
				<BookOpen class="h-8 w-8 text-green-200" />
			</div>
		</div>

		<div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-blue-100 text-sm">Completed</p>
					<p class="text-2xl font-bold">{data.certificates.length}</p>
				</div>
				<Award class="h-8 w-8 text-blue-200" />
			</div>
		</div>

		<div class="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-yellow-100 text-sm">In Progress</p>
					<p class="text-2xl font-bold">
						{data.enrolledCourses.filter(e => e.progress > 0 && e.progress < 100).length}
					</p>
				</div>
				<Clock class="h-8 w-8 text-yellow-200" />
			</div>
		</div>

		<div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-purple-100 text-sm">Average Progress</p>
					<p class="text-2xl font-bold">
						{data.enrolledCourses.length > 0 
							? Math.round(data.enrolledCourses.reduce((acc, e) => acc + e.progress, 0) / data.enrolledCourses.length)
							: 0}%
					</p>
				</div>
				<CheckCircle class="h-8 w-8 text-purple-200" />
			</div>
		</div>
	</div>

	<!-- Enrolled Courses -->
	{#if data.enrolledCourses.length > 0}
		<div class="mb-12">
			<h2 class="text-2xl font-bold text-gray-900 mb-6">Currently Learning</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each data.enrolledCourses as enrollment}
					<div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
						<!-- Course Image -->
						<div class="h-48 bg-gradient-to-br from-green-400 to-green-600 relative">
							{#if enrollment.course.imageUrl}
								<img 
									src={enrollment.course.imageUrl} 
									alt={enrollment.course.title}
									class="w-full h-full object-cover"
								/>
							{:else}
								<div class="flex items-center justify-center h-full">
									<span class="text-6xl">
										{getLanguageFlag(enrollment.course.language)}
									</span>
								</div>
							{/if}
							
							<!-- Progress overlay -->
							<div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
								<div class="flex justify-between items-center text-sm">
									<span>{enrollment.progress}% Complete</span>
									<span class="px-2 py-1 bg-white bg-opacity-20 rounded text-xs">
										{enrollment.course.level}
									</span>
								</div>
								<div class="w-full bg-gray-300 bg-opacity-30 rounded-full h-2 mt-1">
									<div 
										class="bg-white h-2 rounded-full transition-all duration-300"
										style="width: {enrollment.progress}%"
									></div>
								</div>
							</div>
						</div>

						<!-- Course Info -->
						<div class="p-6">
							<h3 class="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
								{enrollment.course.title}
							</h3>
							
							<div class="flex items-center text-gray-600 text-sm mb-3">
								<span class="mr-4 flex items-center">
									<Users class="h-4 w-4 mr-1" />
									{enrollment.course._count.enrollments}
								</span>
								<span class="flex items-center">
									<BookOpen class="h-4 w-4 mr-1" />
									{enrollment.course._count.lessons} lessons
								</span>
							</div>

							<p class="text-gray-600 text-sm mb-4 line-clamp-2">
								{enrollment.course.description || 'Learn ' + enrollment.course.language.toLowerCase() + ' language from basics to advanced level.'}
							</p>

							<div class="flex items-center justify-between">
								<div class="flex items-center text-sm text-gray-500">
									<Clock class="h-4 w-4 mr-1" />
									Started {formatDate(enrollment.startedAt)}
								</div>
								
								<button class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center">
									<Play class="h-4 w-4 mr-1" />
									{enrollment.progress > 0 ? 'Continue' : 'Start'}
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="text-center py-12 bg-gray-50 rounded-lg mb-12">
			<BookOpen class="h-16 w-16 text-gray-400 mx-auto mb-4" />
			<h3 class="text-xl font-semibold text-gray-900 mb-2">No courses enrolled yet</h3>
			<p class="text-gray-600 mb-6">Start your Nigerian language learning journey today!</p>
			<a 
				href="/courses" 
				class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 inline-flex items-center"
			>
				<BookOpen class="h-5 w-5 mr-2" />
				Browse Courses
			</a>
		</div>
	{/if}

	<!-- Certificates Section -->
	{#if data.certificates.length > 0}
		<div>
			<h2 class="text-2xl font-bold text-gray-900 mb-6">Your Certificates</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each data.certificates as certificate}
					<div class="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
						<div class="flex items-center justify-between mb-4">
							<Award class="h-8 w-8 text-yellow-600" />
							<span class="text-sm text-yellow-700 font-medium">Certificate</span>
						</div>
						
						<h3 class="font-semibold text-lg text-gray-900 mb-2">
							{certificate.course.title}
						</h3>
						
						<div class="text-sm text-gray-600 mb-4">
							<p class="mb-1">Score: <span class="font-medium text-yellow-700">{certificate.score}%</span></p>
							<p>Completed: {formatDate(certificate.dateIssued)}</p>
						</div>
						
						<button class="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg transition-colors duration-200">
							View Certificate
						</button>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
