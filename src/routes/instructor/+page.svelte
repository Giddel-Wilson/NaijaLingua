<script lang="ts">
	import { 
		BookOpen, 
		Users, 
		TrendingUp, 
		Award,
		Eye,
		Edit,
		Calendar,
		Clock,
		ChevronRight
	} from 'lucide-svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
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
			TIV: '🟤',
			EFIK: '🟤',
			FULFULDE: '🔴',
			IBIBIO: '🟣',
			IJAW: '🟡'
		};
		return flags[language] || '🌍';
	}

	function formatProgress(progress: number): string {
		return `${Math.round(progress)}%`;
	}
</script>

<svelte:head>
	<title>Instructor Dashboard - NaijaLingua</title>
</svelte:head>

<div class="space-y-6">
	<!-- Welcome Section -->
	<div class="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
		<h1 class="text-3xl font-bold mb-2">Welcome back, {data.user.name}!</h1>
		<p class="text-green-100">Here's what's happening with your courses today.</p>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		<div class="bg-white rounded-lg shadow-sm p-6 border">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">Total Courses</p>
					<p class="text-3xl font-bold text-gray-900">{data.stats.coursesCount}</p>
				</div>
				<div class="p-3 bg-blue-100 rounded-full">
					<BookOpen class="h-6 w-6 text-blue-600" />
				</div>
			</div>
			<div class="mt-2 flex items-center text-sm">
				<span class="text-green-600 font-medium">{data.stats.publishedCourses}</span>
				<span class="text-gray-600 ml-1">published</span>
			</div>
		</div>

		<div class="bg-white rounded-lg shadow-sm p-6 border">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">Total Students</p>
					<p class="text-3xl font-bold text-gray-900">{data.stats.totalStudents}</p>
				</div>
				<div class="p-3 bg-green-100 rounded-full">
					<Users class="h-6 w-6 text-green-600" />
				</div>
			</div>
			<div class="mt-2 flex items-center text-sm">
				<span class="text-green-600 font-medium">+{data.monthlyStats.enrollments}</span>
				<span class="text-gray-600 ml-1">this month</span>
			</div>
		</div>

		<div class="bg-white rounded-lg shadow-sm p-6 border">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">Course Completions</p>
					<p class="text-3xl font-bold text-gray-900">{data.monthlyStats.completions}</p>
				</div>
				<div class="p-3 bg-yellow-100 rounded-full">
					<Award class="h-6 w-6 text-yellow-600" />
				</div>
			</div>
			<div class="mt-2 flex items-center text-sm">
				<TrendingUp class="h-4 w-4 text-green-600 mr-1" />
				<span class="text-green-600 font-medium">Growing</span>
			</div>
		</div>

		<div class="bg-white rounded-lg shadow-sm p-6 border">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">Revenue</p>
					<p class="text-3xl font-bold text-gray-900">${data.stats.totalRevenue}</p>
				</div>
				<div class="p-3 bg-purple-100 rounded-full">
					<TrendingUp class="h-6 w-6 text-purple-600" />
				</div>
			</div>
			<div class="mt-2 flex items-center text-sm">
				<span class="text-gray-600">Coming soon</span>
			</div>
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<div class="lg:col-span-2">
			<!-- Recent Courses -->
			<div class="bg-white rounded-lg shadow-sm border">
				<div class="p-6 border-b">
					<div class="flex items-center justify-between">
						<h2 class="text-lg font-semibold text-gray-900">Recent Courses</h2>
						<a href="/instructor/courses" class="text-green-600 hover:text-green-700 text-sm font-medium flex items-center">
							View all
							<ChevronRight class="h-4 w-4 ml-1" />
						</a>
					</div>
				</div>
				<div class="p-6">
					{#if data.recentCourses.length > 0}
						<div class="space-y-4">
							{#each data.recentCourses as course}
								<div class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
									<div class="flex items-center space-x-4">
										<span class="text-2xl">{getLanguageFlag(course.language)}</span>
										<div>
											<h3 class="font-medium text-gray-900">{course.title}</h3>
											<div class="flex items-center space-x-4 text-sm text-gray-500 mt-1">
												<span class="flex items-center">
													<Users class="h-4 w-4 mr-1" />
													{course._count.enrollments} students
												</span>
												<span class="flex items-center">
													<BookOpen class="h-4 w-4 mr-1" />
													{course._count.lessons} lessons
												</span>
												<span class="flex items-center">
													<Calendar class="h-4 w-4 mr-1" />
													{formatDate(course.createdAt)}
												</span>
											</div>
										</div>
									</div>
									<div class="flex items-center space-x-2">
										<span class="px-2 py-1 text-xs rounded-full {course.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
											{course.isPublished ? 'Published' : 'Draft'}
										</span>
										<a href="/instructor/courses/{course.id}" class="p-2 text-gray-400 hover:text-gray-600">
											<Eye class="h-4 w-4" />
										</a>
										<a href="/instructor/courses/{course.id}/edit" class="p-2 text-gray-400 hover:text-gray-600">
											<Edit class="h-4 w-4" />
										</a>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="text-center py-8">
							<BookOpen class="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<h3 class="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
							<p class="text-gray-600 mb-4">Start by creating your first course</p>
							<a href="/instructor/courses/new" class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
								<BookOpen class="h-4 w-4 mr-2" />
								Create Course
							</a>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<div>
			<!-- Recent Student Activity -->
			<div class="bg-white rounded-lg shadow-sm border">
				<div class="p-6 border-b">
					<h2 class="text-lg font-semibold text-gray-900">Recent Student Activity</h2>
				</div>
				<div class="p-6">
					{#if data.recentEnrollments.length > 0}
						<div class="space-y-4">
							{#each data.recentEnrollments.slice(0, 5) as enrollment}
								<div class="flex items-center space-x-3">
									{#if enrollment.user.profileImage}
										<img src={enrollment.user.profileImage} alt={enrollment.user.name} class="h-8 w-8 rounded-full" />
									{:else}
										<div class="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
											<span class="text-white text-sm font-medium">{enrollment.user.name.charAt(0)}</span>
										</div>
									{/if}
									<div class="flex-1 min-w-0">
										<p class="text-sm font-medium text-gray-900 truncate">{enrollment.user.name}</p>
										<p class="text-xs text-gray-500 truncate">Enrolled in {enrollment.course.title}</p>
										<div class="flex items-center mt-1">
											<div class="w-full bg-gray-200 rounded-full h-1.5">
												<div class="bg-green-600 h-1.5 rounded-full" style="width: {enrollment.progress}%"></div>
											</div>
											<span class="text-xs text-gray-500 ml-2">{formatProgress(enrollment.progress)}</span>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="text-center py-8">
							<Users class="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<p class="text-gray-600">No student activity yet</p>
						</div>
					{/if}
				</div>
			</div>

			<!-- Quick Actions -->
			<div class="bg-white rounded-lg shadow-sm border mt-6">
				<div class="p-6 border-b">
					<h2 class="text-lg font-semibold text-gray-900">Quick Actions</h2>
				</div>
				<div class="p-6 space-y-3">
					<a href="/instructor/courses/new" class="flex items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors">
						<BookOpen class="h-5 w-5 text-green-600 mr-3" />
						<span class="font-medium">Create New Course</span>
					</a>
					<a href="/instructor/students" class="flex items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors">
						<Users class="h-5 w-5 text-blue-600 mr-3" />
						<span class="font-medium">View All Students</span>
					</a>
					<a href="/instructor/analytics" class="flex items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors">
						<TrendingUp class="h-5 w-5 text-purple-600 mr-3" />
						<span class="font-medium">View Analytics</span>
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
