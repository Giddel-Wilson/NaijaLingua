<script lang="ts">
	import { 
		BookOpen, 
		Award, 
		Clock, 
		TrendingUp, 
		Calendar, 
		Target, 
		Zap, 
		Globe, 
		CheckCircle,
		BarChart3,
		Trophy,
		Flame
	} from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function formatTime(minutes: number) {
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
	}

	function getLanguageFlag(language: string) {
		// NaijaLingua is focused on Igbo language learning
		return ''; // Always return Igbo flag since we're Igbo-focused
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
</script>

<svelte:head>
	<title>My Igbo Learning Progress - NaijaLingua</title>
</svelte:head>

<div class="p-6">
	<!-- Page Header -->
	<div class="mb-8">
		<h1 class="text-2xl font-bold text-gray-900">My Learning Progress</h1>
		<p class="text-gray-600">Track your journey learning Igbo language</p>
	</div>

	<!-- Key Metrics Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
		<!-- Courses Completed -->
		<div class="bg-white rounded-xl border border-gray-200 p-6">
			<div class="flex items-center">
				<div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
					<Trophy class="h-6 w-6 text-green-600" />
				</div>
				<div class="ml-4">
					<p class="text-2xl font-bold text-gray-900">{data.completedCourses}</p>
					<p class="text-sm text-gray-600">Courses Completed</p>
				</div>
			</div>
		</div>

		<!-- Certificates Earned -->
		<div class="bg-white rounded-xl border border-gray-200 p-6">
			<div class="flex items-center">
				<div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
					<Award class="h-6 w-6 text-yellow-600" />
				</div>
				<div class="ml-4">
					<p class="text-2xl font-bold text-gray-900">{data.totalCertificates}</p>
					<p class="text-sm text-gray-600">Certificates Earned</p>
				</div>
			</div>
		</div>

		<!-- Learning Streak -->
		<div class="bg-white rounded-xl border border-gray-200 p-6">
			<div class="flex items-center">
				<div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
					<Flame class="h-6 w-6 text-orange-600" />
				</div>
				<div class="ml-4">
					<p class="text-2xl font-bold text-gray-900">{data.activeDaysLast30}</p>
					<p class="text-sm text-gray-600">Active Days (30d)</p>
				</div>
			</div>
		</div>

		<!-- Total Time -->
		<div class="bg-white rounded-xl border border-gray-200 p-6">
			<div class="flex items-center">
				<div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
					<Clock class="h-6 w-6 text-blue-600" />
				</div>
				<div class="ml-4">
					<p class="text-2xl font-bold text-gray-900">{formatTime(data.totalTimeSpent)}</p>
					<p class="text-sm text-gray-600">Time Spent Learning</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Progress Overview -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
		<!-- Overall Progress -->
		<div class="bg-white rounded-xl border border-gray-200 p-6">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold text-gray-900">Overall Progress</h2>
				<div class="text-2xl font-bold text-green-600">{data.completionRate}%</div>
			</div>
			
			<div class="space-y-4">
				<div>
					<div class="flex justify-between text-sm text-gray-600 mb-1">
						<span>Lessons Completed</span>
						<span>{data.completedLessons} / {data.totalLessons}</span>
					</div>
					<div class="w-full bg-gray-200 rounded-full h-3">
						<div 
							class="bg-green-600 h-3 rounded-full transition-all duration-300"
							style="width: {data.completionRate}%"
						></div>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4 pt-4 border-t">
					<div class="text-center">
						<p class="text-2xl font-bold text-blue-600">{data.inProgressCourses}</p>
						<p class="text-sm text-gray-600">In Progress</p>
					</div>
					<div class="text-center">
						<p class="text-2xl font-bold text-gray-600">{data.totalEnrollments - data.completedCourses - data.inProgressCourses}</p>
						<p class="text-sm text-gray-600">Not Started</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Igbo Learning Progress -->
		<div class="bg-white rounded-xl border border-gray-200 p-6">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold text-gray-900">Igbo Learning</h2>
				<span class="text-2xl">🔵</span>
			</div>
			
			<div class="space-y-3">
				<div>
					<p class="text-sm text-gray-600 mb-2">Current Progress</p>
					<div class="flex items-center gap-3">
						<span class="inline-flex items-center px-4 py-2 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200">
							🔵 Igbo Language
						</span>
						<span class="text-sm text-gray-500">{data.completionRate}% Complete</span>
					</div>
				</div>

				{#if data.totalCertificates > 0}
					<div class="pt-3 border-t">
						<p class="text-sm text-gray-600 mb-2">Achievements</p>
						<div class="flex items-center gap-2">
							<span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-50 text-green-700 border border-green-200">
								🔵 Igbo
								<CheckCircle class="h-3 w-3 ml-1" />
							</span>
							<span class="text-xs text-green-600 font-medium">{data.totalCertificates} certificate{data.totalCertificates !== 1 ? 's' : ''} earned</span>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Igbo Learning Performance -->
	{#if data.totalLessons > 0}
		<div class="bg-white rounded-xl border border-gray-200 p-6 mb-8">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-lg font-semibold text-gray-900">Igbo Learning Performance</h2>
				<span class="text-2xl">🔵</span>
			</div>

			<div class="p-4 border border-blue-200 rounded-lg bg-blue-50">
				<div class="flex items-center justify-between mb-3">
					<div class="flex items-center">
						<span class="text-2xl mr-2">🔵</span>
						<div>
							<h3 class="font-medium text-gray-900">Igbo Language</h3>
							<p class="text-sm text-gray-600">
								{data.completedCourses} / {data.totalEnrollments} courses completed
							</p>
						</div>
					</div>
					<div class="text-right">
						<p class="text-lg font-bold text-green-600">{data.completionRate}%</p>
						<p class="text-xs text-gray-500">completion rate</p>
					</div>
				</div>

				<div class="w-full bg-gray-200 rounded-full h-3 mb-2">
					<div 
						class="bg-green-600 h-3 rounded-full transition-all duration-300"
						style="width: {data.completionRate}%"
					></div>
				</div>

				<div class="flex justify-between text-sm text-gray-600">
					<span>{data.completedLessons} / {data.totalLessons} lessons completed</span>
					<span>{data.totalCertificates} certificate{data.totalCertificates !== 1 ? 's' : ''} earned</span>
				</div>
			</div>
		</div>
	{/if}

	<!-- Recent Activity -->
	{#if data.recentProgress.length > 0}
		<div class="bg-white rounded-xl border border-gray-200 p-6 mb-8">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-lg font-semibold text-gray-900">Recent Activity</h2>
				<Calendar class="h-5 w-5 text-gray-500" />
			</div>

			<div class="space-y-3">
				{#each data.recentProgress.slice(0, 5) as progress}
					<div class="flex items-center p-3 bg-gray-50 rounded-lg">
						<div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
							<CheckCircle class="h-5 w-5 text-green-600" />
						</div>
						<div class="flex-1">
							<p class="font-medium text-gray-900">Completed: {progress.lesson.course.title}</p>
							<p class="text-sm text-gray-600">
								🔵 Igbo • 
								{progress.completedAt ? formatDate(progress.completedAt) : 'Recently'}
							</p>
						</div>
						<div class="text-sm text-green-600 font-medium">+1 lesson</div>
					</div>
				{/each}
			</div>

			{#if data.recentProgress.length > 5}
				<div class="mt-4 text-center">
					<button class="text-green-600 hover:text-green-700 text-sm font-medium">
						View All Activity
					</button>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Certificates Preview -->
	{#if data.certificates.length > 0}
		<div class="bg-white rounded-xl border border-gray-200 p-6">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-lg font-semibold text-gray-900">Recent Certificates</h2>
				<a href="/dashboard/certificates" class="text-green-600 hover:text-green-700 text-sm font-medium">
					View All →
				</a>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each data.certificates.slice(0, 3) as certificate}
					<div class="border border-yellow-200 rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-orange-50">
						<div class="text-center mb-3">
							<Award class="h-8 w-8 text-yellow-600 mx-auto mb-2" />
							<h3 class="font-medium text-gray-900 text-sm">{certificate.course.title}</h3>
						</div>
						
						<div class="text-center text-sm text-gray-600">
							<p class="mb-1">Score: <span class="font-medium text-yellow-700">{certificate.score}%</span></p>
							<p class="mb-3">{formatDate(certificate.dateIssued)}</p>
						</div>
						
						<a 
							href="/dashboard/certificates/{certificate.id}"
							class="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded-lg transition-colors duration-200 text-sm font-medium text-center block"
						>
							View Certificate
						</a>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="bg-white rounded-xl border border-gray-200 p-8 text-center">
			<div class="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-4">
				<Target class="h-8 w-8 text-gray-400" />
			</div>
			<h3 class="text-lg font-medium text-gray-900 mb-2">Start Your Learning Journey</h3>
			<p class="text-gray-600 mb-4">Complete your first course to earn a certificate and track your progress!</p>
			<a 
				href="/dashboard/courses" 
				class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 inline-flex items-center"
			>
				<BookOpen class="h-4 w-4 mr-2" />
				Browse Courses
			</a>
		</div>
	{/if}
</div>