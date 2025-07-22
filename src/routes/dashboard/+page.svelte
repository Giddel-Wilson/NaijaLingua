<script lang="ts">
	import { 
		BookOpen, 
		TrendingUp, 
		Award, 
		Clock,
		ArrowRight,
		Play,
		CheckCircle,
		Settings
	} from 'lucide-svelte';
	import { formatLanguage, formatLevel, formatProgress, formatDate } from '$lib/utils';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	
	// Calculate stats
	const totalCourses = $derived(data.enrollments.length);
	const completedCourses = $derived(data.certificates.length);
	const averageProgress = $derived(data.enrollments.length > 0 
		? data.enrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0) / data.enrollments.length
		: 0);
	
	// Recent activity
	const recentEnrollments = $derived(data.enrollments
		.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
		.slice(0, 3));
	
	const recentCertificates = $derived(data.certificates.slice(0, 3));
</script>

<svelte:head>
	<title>Dashboard - NaijaLingua</title>
</svelte:head>

<div class="p-8">
	<!-- Welcome Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">
			Welcome back, {data.user.name}!
		</h1>
		<p class="text-gray-600 mt-2 text-lg">
			Continue your language learning journey
		</p>
	</div>
	
	<!-- Stats Cards -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
			<div class="flex items-center">
				<div class="p-3 rounded-full bg-blue-100">
					<BookOpen class="h-6 w-6 text-blue-600" />
				</div>
				<div class="ml-4">
					<h3 class="text-2xl font-bold text-gray-900">{totalCourses}</h3>
					<p class="text-gray-600 text-sm font-medium">Enrolled Courses</p>
				</div>
			</div>
		</div>
		
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
			<div class="flex items-center">
				<div class="p-3 rounded-full bg-green-100">
					<CheckCircle class="h-6 w-6 text-green-600" />
				</div>
				<div class="ml-4">
					<h3 class="text-2xl font-bold text-gray-900">{completedCourses}</h3>
					<p class="text-gray-600 text-sm font-medium">Completed</p>
				</div>
			</div>
		</div>
		
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
			<div class="flex items-center">
				<div class="p-3 rounded-full bg-purple-100">
					<TrendingUp class="h-6 w-6 text-purple-600" />
				</div>
				<div class="ml-4">
					<h3 class="text-2xl font-bold text-gray-900">{formatProgress(averageProgress)}</h3>
					<p class="text-gray-600 text-sm font-medium">Avg. Progress</p>
				</div>
			</div>
		</div>
		
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
			<div class="flex items-center">
				<div class="p-3 rounded-full bg-amber-100">
					<Award class="h-6 w-6 text-amber-600" />
				</div>
				<div class="ml-4">
					<h3 class="text-2xl font-bold text-gray-900">{data.certificates.length}</h3>
					<p class="text-gray-600 text-sm font-medium">Certificates</p>
				</div>
			</div>
		</div>
	</div>
	
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
		<!-- Continue Learning -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-2xl font-bold text-gray-900">Continue Learning</h2>
				<a href="/dashboard/courses" class="text-primary hover:text-primary/80 text-sm font-semibold flex items-center">
					View All
					<ArrowRight class="w-4 h-4 ml-1" />
				</a>
			</div>
			
			{#if recentEnrollments.length === 0}
				<div class="text-center py-12">
					<BookOpen class="w-16 h-16 text-gray-400 mx-auto mb-4" />
					<p class="text-gray-600 mb-6 text-lg">No courses enrolled yet</p>
					<a href="/courses" class="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors">
						Browse Courses
					</a>
				</div>
			{:else}
				<div class="space-y-4">
					{#each recentEnrollments as enrollment}
						<div class="flex items-center justify-between p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
							<div class="flex-1">
								<h3 class="font-semibold text-gray-900 text-lg">{enrollment.course.title}</h3>
								<p class="text-sm text-gray-600">
									{formatLanguage(enrollment.course.language)} • {formatLevel(enrollment.course.level)}
								</p>
								<div class="mt-2">
									<div class="flex items-center justify-between text-sm text-gray-600 mb-1">
										<span>Progress</span>
										<span>{formatProgress(enrollment.progress)}</span>
									</div>
									<div class="w-full bg-gray-200 rounded-full h-2">
										<div 
											class="bg-primary h-2 rounded-full" 
											style="width: {enrollment.progress}%"
										></div>
									</div>
								</div>
							</div>
							<a 
								href="/courses/{enrollment.courseId}"
								class="ml-4 p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
							>
								<Play class="w-5 h-5" />
							</a>
						</div>
					{/each}
				</div>
			{/if}
		</div>
		
		<!-- Recent Achievements -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-2xl font-bold text-gray-900">Recent Achievements</h2>
				<a href="/dashboard/certificates" class="text-primary hover:text-primary/80 text-sm font-semibold flex items-center">
					View All
					<ArrowRight class="w-4 h-4 ml-1" />
				</a>
			</div>
			
			{#if recentCertificates.length === 0}
				<div class="text-center py-12">
					<Award class="w-16 h-16 text-gray-400 mx-auto mb-4" />
					<p class="text-gray-600 mb-2 text-lg">No certificates earned yet</p>
					<p class="text-gray-500 text-sm">Complete courses to earn certificates</p>
				</div>
			{:else}
				<div class="space-y-4">
					{#each recentCertificates as certificate}
						<div class="flex items-center p-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
							<div class="p-3 bg-amber-100 rounded-full mr-4">
								<Award class="w-6 h-6 text-amber-600" />
							</div>
							<div class="flex-1">
								<h3 class="font-semibold text-gray-900 text-lg">{certificate.course.title}</h3>
								<p class="text-sm text-gray-600 mt-1">
									{formatLanguage(certificate.course.language)} • Score: {Math.round(certificate.score)}%
								</p>
								<p class="text-xs text-gray-500 mt-1">
									Earned on {formatDate(certificate.dateIssued)}
								</p>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Quick Actions -->
	<!-- Quick Actions -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
		<h2 class="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<a href="/courses" class="flex items-center p-6 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors group">
				<BookOpen class="w-10 h-10 text-primary mr-4 group-hover:scale-110 transition-transform" />
				<div>
					<h3 class="font-semibold text-gray-900 text-lg">Browse Courses</h3>
					<p class="text-sm text-gray-600">Discover new languages</p>
				</div>
			</a>
			
			<a href="/dashboard/certificates" class="flex items-center p-6 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors group">
				<Award class="w-10 h-10 text-amber-600 mr-4 group-hover:scale-110 transition-transform" />
				<div>
					<h3 class="font-semibold text-gray-900 text-lg">View Certificates</h3>
					<p class="text-sm text-gray-600">Download achievements</p>
				</div>
			</a>
			
			<a href="/dashboard/settings" class="flex items-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
				<Settings class="w-10 h-10 text-gray-600 mr-4 group-hover:scale-110 transition-transform" />
				<div>
					<h3 class="font-semibold text-gray-900 text-lg">Account Settings</h3>
					<p class="text-sm text-gray-600">Manage your profile</p>
				</div>
			</a>
		</div>
	</div>
</div>
