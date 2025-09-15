<script lang="ts">
	import { BookOpen, Clock, Users, Award, Play, CheckCircle, TrendingUp } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

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
				return 'bg-green-50 text-green-700 border-green-200';
			case 'INTERMEDIATE':
				return 'bg-orange-50 text-orange-700 border-orange-200';
			case 'ADVANCED':
				return 'bg-red-50 text-red-700 border-red-200';
			default:
				return 'bg-gray-50 text-gray-700 border-gray-200';
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
	<!-- Page Header -->
	<div class="mb-8">
		<h1 class="text-2xl font-bold text-gray-900">My Courses</h1>
		<p class="mt-1 text-gray-600">Track your progress and continue learning Nigerian languages</p>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
		<div class="bg-white rounded-xl border border-gray-200 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">Enrolled Courses</p>
					<p class="text-2xl font-bold text-gray-900">{data.enrolledCourses.length}</p>
				</div>
				<div class="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
					<BookOpen class="h-6 w-6 text-green-600" />
				</div>
			</div>
		</div>

		<div class="bg-white rounded-xl border border-gray-200 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">Completed</p>
					<p class="text-2xl font-bold text-gray-900">{data.certificates.length}</p>
				</div>
				<div class="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
					<Award class="h-6 w-6 text-green-600" />
				</div>
			</div>
		</div>

		<div class="bg-white rounded-xl border border-gray-200 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">In Progress</p>
					<p class="text-2xl font-bold text-gray-900">
						{data.enrolledCourses.filter(e => e.progress > 0 && e.progress < 100).length}
					</p>
				</div>
				<div class="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
					<TrendingUp class="h-6 w-6 text-orange-600" />
				</div>
			</div>
		</div>

		<div class="bg-white rounded-xl border border-gray-200 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">Average Progress</p>
					<p class="text-2xl font-bold text-gray-900">
						{data.enrolledCourses.length > 0 
							? Math.round(data.enrolledCourses.reduce((acc, e) => acc + e.progress, 0) / data.enrolledCourses.length)
							: 0}%
					</p>
				</div>
				<div class="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
					<CheckCircle class="h-6 w-6 text-purple-600" />
				</div>
			</div>
		</div>
	</div>

	<!-- Enrolled Courses -->
	{#if data.enrolledCourses.length > 0}
		<div class="mb-8">
			<div class="bg-white rounded-xl border border-gray-200 p-6">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-lg font-semibold text-gray-900">Currently Learning</h2>
					<a href="/courses" class="text-sm text-green-600 hover:text-green-700 font-medium">Browse more</a>
				</div>
				
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each data.enrolledCourses as enrollment}
						<div class="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors border border-gray-200">
							<!-- Course Header -->
							<div class="flex items-center justify-between mb-4">
								<div class="flex items-center">
									<div class="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
										<span class="text-lg">
											{getLanguageFlag(enrollment.course.language)}
										</span>
									</div>
									<div class="ml-3">
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border {getLevelColor(enrollment.course.level)}">
											{enrollment.course.level}
										</span>
									</div>
								</div>
								<div class="text-right">
									<p class="text-sm font-medium text-gray-900">{enrollment.progress}%</p>
									<p class="text-xs text-gray-500">Complete</p>
								</div>
							</div>

							<!-- Course Info -->
							<h3 class="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
								{enrollment.course.title}
							</h3>
							
							<p class="text-gray-600 text-sm mb-4 line-clamp-2">
								{enrollment.course.description || 'Learn ' + enrollment.course.language.toLowerCase() + ' language from basics to advanced level.'}
							</p>

							<!-- Progress Bar -->
							<div class="mb-4">
								<div class="w-full bg-gray-200 rounded-full h-2">
									<div 
										class="bg-green-600 h-2 rounded-full transition-all duration-300"
										style="width: {enrollment.progress}%"
									></div>
								</div>
							</div>

							<!-- Course Stats -->
							<div class="flex items-center text-gray-600 text-sm mb-4">
								<span class="mr-4 flex items-center">
									<Users class="h-4 w-4 mr-1" />
									{enrollment.course._count.enrollments}
								</span>
								<span class="flex items-center">
									<BookOpen class="h-4 w-4 mr-1" />
									{enrollment.course._count.lessons} lessons
								</span>
							</div>

							<!-- Action Area -->
							<div class="flex items-center justify-between">
								<div class="flex items-center text-sm text-gray-500">
									<Clock class="h-4 w-4 mr-1" />
									Started {formatDate(enrollment.startedAt)}
								</div>
								
								{#if enrollment.progress >= 100}
									<div class="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg flex items-center text-sm cursor-not-allowed">
										<CheckCircle class="h-4 w-4 mr-1" />
										Completed
									</div>
								{:else}
									<a 
										href="/dashboard/courses/{enrollment.course.id}"
										class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center text-sm"
									>
										<Play class="h-4 w-4 mr-1" />
										{enrollment.progress > 0 ? 'Continue' : 'Start'}
									</a>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{:else}
		<div class="mb-8">
			<div class="bg-white rounded-xl border border-gray-200 p-8">
				<div class="text-center">
					<div class="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-4">
						<BookOpen class="h-8 w-8 text-gray-400" />
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">No courses enrolled yet</h3>
					<p class="text-gray-600 mb-6">Start your Nigerian language learning journey today!</p>
					<a 
						href="/courses" 
						class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
					>
						<BookOpen class="h-4 w-4 mr-2" />
						Browse Courses
					</a>
				</div>
			</div>
		</div>
	{/if}

	<!-- Certificates Section -->
	{#if data.certificates.length > 0}
		<div class="bg-white rounded-xl border border-gray-200 p-6">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-lg font-semibold text-gray-900">Your Certificates</h2>
				<span class="text-sm text-gray-600">{data.certificates.length} earned</span>
			</div>
			
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each data.certificates as certificate}
					<div class="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
						<div class="flex items-center justify-between mb-4">
							<div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
								<Award class="h-6 w-6 text-yellow-600" />
							</div>
							<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
								Certificate
							</span>
						</div>
						
						<h3 class="font-semibold text-lg text-gray-900 mb-2">
							{certificate.course.title}
						</h3>
						
						<div class="text-sm text-gray-600 mb-4">
							<p class="mb-1">Score: <span class="font-medium text-yellow-700">{certificate.score}%</span></p>
							<p>Completed: {formatDate(certificate.dateIssued)}</p>
						</div>
						
						<a 
							href="/dashboard/certificates/{certificate.id}" 
							class="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 text-sm font-medium text-center block"
						>
							View Certificate
						</a>
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
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
