<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { 
		Edit, 
		Trash2, 
		Eye, 
		EyeOff, 
		Users, 
		BookOpen, 
		Play,
		DollarSign,
		Calendar,
		Settings,
		BarChart3,
		HelpCircle
	} from 'lucide-svelte';

	let course: any = null;
	let loading = true;
	let error = '';

	const courseId = $page.params.id;

	onMount(async () => {
		await fetchCourse();
		loading = false;
	});

	async function fetchCourse() {
		try {
			const response = await fetch(`/api/courses/${courseId}`, {
				credentials: 'include'
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to fetch course');
			}

			course = await response.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to fetch course';
		}
	}

	async function togglePublish() {
		try {
			const response = await fetch(`/api/courses/${courseId}/publish`, {
				method: 'POST',
				credentials: 'include'
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to update course');
			}

			// Refresh course data
			await fetchCourse();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to update course';
		}
	}

	async function deleteCourse() {
		if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
			return;
		}

		try {
			const response = await fetch(`/api/courses/${courseId}`, {
				method: 'DELETE',
				credentials: 'include'
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to delete course');
			}

			goto('/instructor/courses');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete course';
		}
	}

	function formatPrice(price: number, currency: string): string {
		if (price === 0) return 'Free';
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency || 'USD'
		}).format(price);
	}
</script>

<svelte:head>
	<title>{course?.title || 'Course'} - Management | NaijaLingua</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	{#if loading}
		<div class="flex justify-center items-center min-h-[200px]">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 rounded-md p-4">
			<div class="flex">
				<div class="ml-3">
					<h3 class="text-sm font-medium text-red-800">Error</h3>
					<div class="mt-2 text-sm text-red-700">
						<p>{error}</p>
					</div>
				</div>
			</div>
		</div>
	{:else if course}
		<!-- Header -->
		<div class="mb-8">
			<nav class="flex items-center space-x-2 text-sm text-gray-500 mb-2">
				<a href="/instructor/courses" class="hover:text-gray-700">Courses</a>
				<span>/</span>
				<span class="text-gray-900">{course.title}</span>
			</nav>
			<div class="flex justify-between items-start">
				<div>
					<h1 class="text-3xl font-bold text-gray-900">{course.title}</h1>
					<p class="text-gray-600 mt-2">{course.description || 'No description available'}</p>
				</div>
				<div class="flex items-center space-x-3">
					<button
						on:click={togglePublish}
						class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
						{#if course.isPublished}
							<EyeOff class="w-4 h-4 mr-2" />
							Unpublish
						{:else}
							<Eye class="w-4 h-4 mr-2" />
							Publish
						{/if}
					</button>
					
					<a
						href="/instructor/courses/{courseId}/edit"
						class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
						<Edit class="w-4 h-4 mr-2" />
						Edit Course
					</a>
					
					<button
						on:click={deleteCourse}
						class="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
					>
						<Trash2 class="w-4 h-4 mr-2" />
						Delete
					</button>
				</div>
			</div>
		</div>

		<!-- Course Info -->
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
							{#if course.isPublished}
								<Eye class="w-6 h-6 text-indigo-600" />
							{:else}
								<EyeOff class="w-6 h-6 text-gray-600" />
							{/if}
						</div>
					</div>
					<div class="ml-4">
						<div class="text-lg font-medium text-gray-900">
							{course.isPublished ? 'Published' : 'Draft'}
						</div>
						<div class="text-sm text-gray-500">Status</div>
					</div>
				</div>

				<div class="flex items-center">
					<div class="flex-shrink-0">
						<div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
							<Users class="w-6 h-6 text-green-600" />
						</div>
					</div>
					<div class="ml-4">
						<div class="text-lg font-medium text-gray-900">{course._count?.enrollments || 0}</div>
						<div class="text-sm text-gray-500">Students</div>
					</div>
				</div>

				<div class="flex items-center">
					<div class="flex-shrink-0">
						<div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
							<BookOpen class="w-6 h-6 text-blue-600" />
						</div>
					</div>
					<div class="ml-4">
						<div class="text-lg font-medium text-gray-900">{course._count?.lessons || 0}</div>
						<div class="text-sm text-gray-500">Lessons</div>
					</div>
				</div>

				<div class="flex items-center">
					<div class="flex-shrink-0">
						<div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
							<DollarSign class="w-6 h-6 text-purple-600" />
						</div>
					</div>
					<div class="ml-4">
						<div class="text-lg font-medium text-gray-900">
							{formatPrice(course.price, course.currency)}
						</div>
						<div class="text-sm text-gray-500">Price</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Course Management Actions -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
			<!-- Lessons Management -->
			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<div class="flex items-center mb-4">
					<BookOpen class="w-6 h-6 text-blue-600 mr-3" />
					<h3 class="text-lg font-medium text-gray-900">Lessons</h3>
				</div>
				<p class="text-gray-600 text-sm mb-4">
					Create and manage course lessons with videos, audio, and quizzes.
				</p>
				<div class="space-y-2">
					<a
						href="/instructor/courses/{courseId}/lessons"
						class="block w-full text-center px-4 py-2 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 text-sm"
					>
						Manage Lessons
					</a>
					<a
						href="/instructor/courses/{courseId}/lessons/new"
						class="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
					>
						Add New Lesson
					</a>
				</div>
			</div>

			<!-- Student Management -->
			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<div class="flex items-center mb-4">
					<Users class="w-6 h-6 text-green-600 mr-3" />
					<h3 class="text-lg font-medium text-gray-900">Students</h3>
				</div>
				<p class="text-gray-600 text-sm mb-4">
					Monitor student progress, engagement, and performance metrics.
				</p>
				<div class="space-y-2">
					<a
						href="/instructor/courses/{courseId}/students"
						class="block w-full text-center px-4 py-2 border border-green-300 text-green-700 rounded-md hover:bg-green-50 text-sm"
					>
						View Students
					</a>
					<div class="text-center text-sm text-gray-500">
						{course._count?.enrollments || 0} students enrolled
					</div>
				</div>
			</div>

			<!-- Analytics -->
			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<div class="flex items-center mb-4">
					<BarChart3 class="w-6 h-6 text-purple-600 mr-3" />
					<h3 class="text-lg font-medium text-gray-900">Analytics</h3>
				</div>
				<p class="text-gray-600 text-sm mb-4">
					View detailed analytics and insights about your course performance.
				</p>
				<div class="space-y-2">
					<button
						class="block w-full text-center px-4 py-2 border border-purple-300 text-purple-700 rounded-md hover:bg-purple-50 text-sm opacity-50 cursor-not-allowed"
						disabled
					>
						Coming Soon
					</button>
				</div>
			</div>
		</div>

		<!-- Course Details -->
		<div class="bg-white rounded-lg shadow-sm border border-gray-200">
			<div class="px-6 py-4 border-b border-gray-200">
				<h3 class="text-lg font-medium text-gray-900">Course Details</h3>
			</div>
			<div class="px-6 py-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<h4 class="text-sm font-medium text-gray-900 mb-2">Basic Information</h4>
						<dl class="space-y-2">
							<div>
								<dt class="text-sm text-gray-500">Language</dt>
								<dd class="text-sm text-gray-900">{course.language}</dd>
							</div>
							<div>
								<dt class="text-sm text-gray-500">Level</dt>
								<dd class="text-sm text-gray-900">{course.level}</dd>
							</div>
							<div>
								<dt class="text-sm text-gray-500">Category</dt>
								<dd class="text-sm text-gray-900">{course.category || 'Not specified'}</dd>
							</div>
						</dl>
					</div>
					<div>
						<h4 class="text-sm font-medium text-gray-900 mb-2">Metadata</h4>
						<dl class="space-y-2">
							<div>
								<dt class="text-sm text-gray-500">Created</dt>
								<dd class="text-sm text-gray-900">
									{new Date(course.createdAt).toLocaleDateString()}
								</dd>
							</div>
							<div>
								<dt class="text-sm text-gray-500">Last Updated</dt>
								<dd class="text-sm text-gray-900">
									{new Date(course.updatedAt).toLocaleDateString()}
								</dd>
							</div>
							<div>
								<dt class="text-sm text-gray-500">Tags</dt>
								<dd class="text-sm text-gray-900">
									{#if course.tags && course.tags.length > 0}
										<div class="flex flex-wrap gap-1 mt-1">
											{#each course.tags as tag}
												<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
													{tag}
												</span>
											{/each}
										</div>
									{:else}
										No tags
									{/if}
								</dd>
							</div>
						</dl>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
