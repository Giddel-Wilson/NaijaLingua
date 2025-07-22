<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Plus, Edit, Trash2, Video, FileAudio, Image, Eye, EyeOff } from 'lucide-svelte';

	let course: any = null;
	let lessons: any[] = [];
	let loading = true;
	let error = '';

	const courseId = $page.params.id;

	onMount(async () => {
		await Promise.all([fetchCourse(), fetchLessons()]);
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

	async function fetchLessons() {
		try {
			const response = await fetch(`/api/courses/${courseId}/lessons`, {
				credentials: 'include'
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to fetch lessons');
			}

			lessons = await response.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to fetch lessons';
		}
	}

	async function deleteLesson(lessonId: string) {
		if (!confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
			return;
		}

		try {
			const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}`, {
				method: 'DELETE',
				credentials: 'include'
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to delete lesson');
			}

			// Remove lesson from local state
			lessons = lessons.filter(lesson => lesson.id !== lessonId);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete lesson';
		}
	}

	async function toggleLessonPublish(lessonId: string, isPublished: boolean) {
		try {
			const formData = new FormData();
			formData.append('isPublished', (!isPublished).toString());

			const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}`, {
				method: 'PUT',
				body: formData,
				credentials: 'include'
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to update lesson');
			}

			const updatedLesson = await response.json();
			
			// Update lesson in local state
			lessons = lessons.map(lesson => 
				lesson.id === lessonId ? updatedLesson : lesson
			);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to update lesson';
		}
	}

	function formatDuration(duration: number | null): string {
		if (!duration) return 'Not set';
		const hours = Math.floor(duration / 60);
		const minutes = duration % 60;
		if (hours > 0) {
			return `${hours}h ${minutes}m`;
		}
		return `${minutes}m`;
	}
</script>

<svelte:head>
	<title>Manage Lessons - {course?.title || 'Course'} | NaijaLingua</title>
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
	{:else}
		<!-- Header -->
		<div class="flex justify-between items-start mb-8">
			<div>
				<nav class="flex items-center space-x-2 text-sm text-gray-500 mb-2">
					<a href="/instructor/courses" class="hover:text-gray-700">Courses</a>
					<span>/</span>
					<a href="/instructor/courses/{courseId}" class="hover:text-gray-700">{course?.title}</a>
					<span>/</span>
					<span class="text-gray-900">Lessons</span>
				</nav>
				<h1 class="text-3xl font-bold text-gray-900">{course?.title} - Lessons</h1>
				<p class="text-gray-600 mt-2">{course?.description || 'No description available'}</p>
			</div>
			<a
				href="/instructor/courses/{courseId}/lessons/new"
				class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
			>
				<Plus class="w-4 h-4 mr-2" />
				Add Lesson
			</a>
		</div>

		<!-- Course Stats -->
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
			<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
				<div class="text-center">
					<div class="text-2xl font-bold text-indigo-600">{lessons.length}</div>
					<div class="text-sm text-gray-500">Total Lessons</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-green-600">
						{lessons.filter(l => l.isPublished).length}
					</div>
					<div class="text-sm text-gray-500">Published</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-yellow-600">
						{lessons.filter(l => !l.isPublished).length}
					</div>
					<div class="text-sm text-gray-500">Drafts</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-purple-600">
						{lessons.reduce((total, lesson) => total + (lesson.quizzes?.length || 0), 0)}
					</div>
					<div class="text-sm text-gray-500">Total Quizzes</div>
				</div>
			</div>
		</div>

		<!-- Lessons List -->
		{#if lessons.length === 0}
			<div class="text-center py-12">
				<Video class="mx-auto h-12 w-12 text-gray-400" />
				<h3 class="mt-2 text-sm font-medium text-gray-900">No lessons</h3>
				<p class="mt-1 text-sm text-gray-500">Get started by creating your first lesson.</p>
				<div class="mt-6">
					<a
						href="/instructor/courses/{courseId}/lessons/new"
						class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
						<Plus class="w-4 h-4 mr-2" />
						Add Lesson
					</a>
				</div>
			</div>
		{:else}
			<div class="space-y-6">
				{#each lessons.sort((a, b) => a.order - b.order) as lesson (lesson.id)}
					<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						<div class="flex items-start justify-between">
							<div class="flex-1 min-w-0">
								<div class="flex items-center space-x-3 mb-2">
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
										Lesson {lesson.order}
									</span>
									{#if lesson.isPublished}
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
											<Eye class="w-3 h-3 mr-1" />
											Published
										</span>
									{:else}
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
											<EyeOff class="w-3 h-3 mr-1" />
											Draft
										</span>
									{/if}
								</div>
								
								<h3 class="text-lg font-medium text-gray-900 mb-2">{lesson.title}</h3>
								
								{#if lesson.description}
									<p class="text-gray-600 text-sm mb-3">{lesson.description}</p>
								{/if}

								<!-- Media indicators -->
								<div class="flex items-center space-x-4 text-sm text-gray-500 mb-3">
									{#if lesson.videoUrl}
										<div class="flex items-center">
											<Video class="w-4 h-4 mr-1" />
											Video
										</div>
									{/if}
									{#if lesson.audioUrl}
										<div class="flex items-center">
											<FileAudio class="w-4 h-4 mr-1" />
											Audio
										</div>
									{/if}
									{#if lesson.imageUrl}
										<div class="flex items-center">
											<Image class="w-4 h-4 mr-1" />
											Image
										</div>
									{/if}
									<div>Duration: {formatDuration(lesson.duration)}</div>
								</div>

								{#if lesson.quizzes && lesson.quizzes.length > 0}
									<div class="text-sm text-purple-600">
										{lesson.quizzes.length} quiz{lesson.quizzes.length === 1 ? '' : 'zes'}
									</div>
								{/if}
							</div>

							<div class="flex items-center space-x-2 ml-4">
								<button
									on:click={() => toggleLessonPublish(lesson.id, lesson.isPublished)}
									class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
								>
									{#if lesson.isPublished}
										<EyeOff class="w-4 h-4 mr-1" />
										Unpublish
									{:else}
										<Eye class="w-4 h-4 mr-1" />
										Publish
									{/if}
								</button>
								
								<a
									href="/instructor/courses/{courseId}/lessons/{lesson.id}/edit"
									class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
								>
									<Edit class="w-4 h-4 mr-1" />
									Edit
								</a>
								
								<button
									on:click={() => deleteLesson(lesson.id)}
									class="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
								>
									<Trash2 class="w-4 h-4 mr-1" />
									Delete
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>
