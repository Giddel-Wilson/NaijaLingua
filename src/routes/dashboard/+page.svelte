<script lang="ts">
	import { 
		BookOpen, 
		TrendingUp, 
		Award, 
		Clock,
		ArrowRight,
		Play,
		CheckCircle
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

<div class="p-6">
	<!-- Welcome Header -->
	<div class="mb-8">
		<h1 class="text-2xl font-bold text-gray-900">
			Welcome back, {data.user.name}!
		</h1>
		<p class="text-gray-600 mt-1">
			Continue your language learning journey
		</p>
	</div>
	
	<!-- Stats Cards -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
		<div class="card">
			<div class="flex items-center">
				<div class="p-3 rounded-full bg-blue-100">
					<BookOpen class="h-6 w-6 text-blue-600" />
				</div>
				<div class="ml-4">
					<h3 class="text-lg font-semibold text-gray-900">{totalCourses}</h3>
					<p class="text-gray-600 text-sm">Enrolled Courses</p>
				</div>
			</div>
		</div>
		
		<div class="card">
			<div class="flex items-center">
				<div class="p-3 rounded-full bg-green-100">
					<CheckCircle class="h-6 w-6 text-green-600" />
				</div>
				<div class="ml-4">
					<h3 class="text-lg font-semibold text-gray-900">{completedCourses}</h3>
					<p class="text-gray-600 text-sm">Completed</p>
				</div>
			</div>
		</div>
		
		<div class="card">
			<div class="flex items-center">
				<div class="p-3 rounded-full bg-purple-100">
					<TrendingUp class="h-6 w-6 text-purple-600" />
				</div>
				<div class="ml-4">
					<h3 class="text-lg font-semibold text-gray-900">{formatProgress(averageProgress)}</h3>
					<p class="text-gray-600 text-sm">Avg. Progress</p>
				</div>
			</div>
		</div>
		
		<div class="card">
			<div class="flex items-center">
				<div class="p-3 rounded-full bg-gold/20">
					<Award class="h-6 w-6 text-gold" />
				</div>
				<div class="ml-4">
					<h3 class="text-lg font-semibold text-gray-900">{data.certificates.length}</h3>
					<p class="text-gray-600 text-sm">Certificates</p>
				</div>
			</div>
		</div>
	</div>
	
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
		<!-- Continue Learning -->
		<div class="card">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-xl font-semibold text-gray-900">Continue Learning</h2>
				<a href="/dashboard/courses" class="text-primary hover:text-primary/80 text-sm font-medium">
					View All
				</a>
			</div>
			
			{#if recentEnrollments.length === 0}
				<div class="text-center py-8">
					<BookOpen class="w-12 h-12 text-gray-400 mx-auto mb-4" />
					<p class="text-gray-600 mb-4">No courses enrolled yet</p>
					<a href="/courses" class="btn-primary">
						Browse Courses
					</a>
				</div>
			{:else}
				<div class="space-y-4">
					{#each recentEnrollments as enrollment}
						<div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
							<div class="flex-1">
								<h3 class="font-medium text-gray-900">{enrollment.course.title}</h3>
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
		<div class="card">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-xl font-semibold text-gray-900">Recent Achievements</h2>
				<a href="/dashboard/certificates" class="text-primary hover:text-primary/80 text-sm font-medium">
					View All
				</a>
			</div>
			
			{#if recentCertificates.length === 0}
				<div class="text-center py-8">
					<Award class="w-12 h-12 text-gray-400 mx-auto mb-4" />
					<p class="text-gray-600 mb-4">No certificates earned yet</p>
					<p class="text-sm text-gray-500">Complete courses to earn certificates</p>
				</div>
			{:else}
				<div class="space-y-4">
					{#each recentCertificates as certificate}
						<div class="flex items-center p-4 bg-gold/10 rounded-lg">
							<div class="p-2 bg-gold/20 rounded-lg mr-4">
								<Award class="w-6 h-6 text-gold" />
							</div>
							<div class="flex-1">
								<h3 class="font-medium text-gray-900">{certificate.course.title}</h3>
								<p class="text-sm text-gray-600">
									{formatLanguage(certificate.course.language)} • Score: {Math.round(certificate.score)}%
								</p>
								<p class="text-xs text-gray-500">
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
	<div class="mt-8 card">
		<h2 class="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<a href="/courses" class="flex items-center p-4 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
				<BookOpen class="w-8 h-8 text-primary mr-4" />
				<div>
					<h3 class="font-medium text-gray-900">Browse Courses</h3>
					<p class="text-sm text-gray-600">Discover new languages</p>
				</div>
			</a>
			
			<a href="/dashboard/certificates" class="flex items-center p-4 bg-gold/10 rounded-lg hover:bg-gold/20 transition-colors">
				<Award class="w-8 h-8 text-gold mr-4" />
				<div>
					<h3 class="font-medium text-gray-900">View Certificates</h3>
					<p class="text-sm text-gray-600">Download achievements</p>
				</div>
			</a>
			
			<a href="/dashboard/settings" class="flex items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
				<Clock class="w-8 h-8 text-gray-600 mr-4" />
				<div>
					<h3 class="font-medium text-gray-900">Account Settings</h3>
					<p class="text-sm text-gray-600">Manage your profile</p>
				</div>
			</a>
		</div>
	</div>
</div>
