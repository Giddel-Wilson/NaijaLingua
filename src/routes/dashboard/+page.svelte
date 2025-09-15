<script lang="ts">
	import { Trophy, TrendingUp, Book, Clock, Play } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Dashboard - NaijaLingua</title>
</svelte:head>

<div class="p-6">
	<!-- Page Header -->
	<div class="mb-8">
		<h1 class="text-2xl font-bold text-gray-900">Welcome back, {data.user.name}!</h1>
		<p class="mt-1 text-gray-600">Continue your language learning journey</p>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
		<div class="bg-white rounded-xl border border-gray-200 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">Courses Enrolled</p>
					<p class="text-2xl font-bold text-gray-900">{data.enrollments?.length || 0}</p>
				</div>
				<div class="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
					<Book class="h-6 w-6 text-green-600" />
				</div>
			</div>
		</div>

		<div class="bg-white rounded-xl border border-gray-200 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">Certificates Earned</p>
					<p class="text-2xl font-bold text-gray-900">{data.certificates?.length || 0}</p>
				</div>
				<div class="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
					<Trophy class="h-6 w-6 text-green-600" />
				</div>
			</div>
		</div>

		<div class="bg-white rounded-xl border border-gray-200 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">Courses Created</p>
					<p class="text-2xl font-bold text-gray-900">{data.courses?.length || 0}</p>
				</div>
				<div class="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
					<TrendingUp class="h-6 w-6 text-orange-600" />
				</div>
			</div>
		</div>

		<div class="bg-white rounded-xl border border-gray-200 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">Total Students</p>
					<p class="text-2xl font-bold text-gray-900">{data.totalEnrollments || 0}</p>
				</div>
				<div class="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
					<Clock class="h-6 w-6 text-purple-600" />
				</div>
			</div>
		</div>
	</div>

	<!-- Content Sections -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Recent Courses -->
		<div class="lg:col-span-2">
			<div class="bg-white rounded-xl border border-gray-200 p-6">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-lg font-semibold text-gray-900">Continue Learning</h2>
					<a href="/dashboard/courses" class="text-sm text-green-600 hover:text-green-700 font-medium">View all</a>
				</div>
				
				{#if data.courses && data.courses.length > 0}
					<div class="space-y-4">
						{#each data.courses.slice(0, 3) as course}
							<div class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
								<div class="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
									<Book class="h-6 w-6 text-white" />
								</div>
								<div class="ml-4 flex-1">
									<h3 class="text-sm font-medium text-gray-900">{course.title}</h3>
									<p class="text-sm text-gray-600">{course.description}</p>
									<div class="mt-2">
										<div class="flex items-center justify-between text-xs text-gray-500">
											<span>Active course</span>
											<span>{course.language} • {course.level}</span>
										</div>
									</div>
								</div>
								<div class="ml-4">
									<a 
										href="/instructor/courses/{course.id}" 
										class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
									>
										<Play class="h-4 w-4 mr-1" />
										Manage
									</a>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="text-center py-8">
						<Book class="mx-auto h-12 w-12 text-gray-400" />
						<h3 class="mt-4 text-sm font-medium text-gray-900">No courses yet</h3>
						<p class="mt-2 text-sm text-gray-500">Start your learning journey by enrolling in a course.</p>
						<div class="mt-4">
							<a
								href="/courses"
								class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
							>
								Browse Courses
							</a>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Right Sidebar -->
		<div class="space-y-6">
			<!-- Learning Goals -->
			<div class="bg-white rounded-xl border border-gray-200 p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-4">Learning Goals</h3>
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-600">Daily lessons</span>
						<span class="text-sm font-medium text-gray-900">2/3</span>
					</div>
					<div class="w-full bg-gray-200 rounded-full h-2">
						<div class="bg-green-600 h-2 rounded-full" style="width: 66%"></div>
					</div>
					
					<div class="flex items-center justify-between mt-4">
						<span class="text-sm text-gray-600">Weekly streak</span>
						<span class="text-sm font-medium text-gray-900">5/7 days</span>
					</div>
					<div class="w-full bg-gray-200 rounded-full h-2">
						<div class="bg-green-600 h-2 rounded-full" style="width: 71%"></div>
					</div>
				</div>
			</div>

			<!-- Quick Actions -->
			<div class="bg-white rounded-xl border border-gray-200 p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
				<div class="space-y-3">
					<a 
						href="/courses" 
						class="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
					>
						Browse All Courses
					</a>
					<a 
						href="/dashboard/analytics" 
						class="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
					>
						View Progress Report
					</a>
					<a 
						href="/dashboard/settings" 
						class="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
					>
						Account Settings
					</a>
				</div>
			</div>
		</div>
	</div>
</div>

