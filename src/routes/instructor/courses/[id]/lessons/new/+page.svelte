<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Upload, X, Video, FileAudio, Image, Save, Eye } from 'lucide-svelte';

	let course: any = null;
	let lessons: any[] = [];
	let loading = true;
	let submitting = false;
	let error = '';
	let success = '';

	// Form data
	let title = '';
	let description = '';
	let contentHtml = '';
	let order = 1;
	let imageFile: File | null = null;
	let videoFile: File | null = null;
	let audioFile: File | null = null;
	let imagePreview = '';
	let videoPreview = '';
	let audioPreview = '';

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
			// Set next order number
			order = lessons.length + 1;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to fetch lessons';
		}
	}

	function handleImageChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		
		if (file) {
			if (!file.type.startsWith('image/')) {
				error = 'Please select a valid image file';
				return;
			}
			if (file.size > 10 * 1024 * 1024) { // 10MB limit
				error = 'Image file size must be less than 10MB';
				return;
			}
			
			imageFile = file;
			imagePreview = URL.createObjectURL(file);
		}
	}

	function handleVideoChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		
		if (file) {
			if (!file.type.startsWith('video/')) {
				error = 'Please select a valid video file';
				return;
			}
			if (file.size > 100 * 1024 * 1024) { // 100MB limit
				error = 'Video file size must be less than 100MB';
				return;
			}
			
			videoFile = file;
			videoPreview = URL.createObjectURL(file);
		}
	}

	function handleAudioChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		
		if (file) {
			if (!file.type.startsWith('audio/')) {
				error = 'Please select a valid audio file';
				return;
			}
			if (file.size > 50 * 1024 * 1024) { // 50MB limit
				error = 'Audio file size must be less than 50MB';
				return;
			}
			
			audioFile = file;
			audioPreview = URL.createObjectURL(file);
		}
	}

	function removeImage() {
		imageFile = null;
		imagePreview = '';
		const input = document.getElementById('image') as HTMLInputElement;
		if (input) input.value = '';
	}

	function removeVideo() {
		videoFile = null;
		videoPreview = '';
		const input = document.getElementById('video') as HTMLInputElement;
		if (input) input.value = '';
	}

	function removeAudio() {
		audioFile = null;
		audioPreview = '';
		const input = document.getElementById('audio') as HTMLInputElement;
		if (input) input.value = '';
	}

	async function handleSubmit(publishImmediately = false) {
		if (!title.trim()) {
			error = 'Please enter a lesson title';
			return;
		}

		submitting = true;
		error = '';
		success = '';

		try {
			const formData = new FormData();
			formData.append('title', title.trim());
			formData.append('description', description.trim());
			formData.append('contentHtml', contentHtml.trim());
			formData.append('order', order.toString());
			
			if (imageFile) {
				formData.append('image', imageFile);
			}
			if (videoFile) {
				formData.append('video', videoFile);
			}
			if (audioFile) {
				formData.append('audio', audioFile);
			}

			const response = await fetch(`/api/courses/${courseId}/lessons`, {
				method: 'POST',
				body: formData,
				credentials: 'include'
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to create lesson');
			}

			const lesson = await response.json();

			// If publish immediately, update the lesson
			if (publishImmediately) {
				const publishFormData = new FormData();
				publishFormData.append('isPublished', 'true');

				const publishResponse = await fetch(`/api/courses/${courseId}/lessons/${lesson.id}`, {
					method: 'PUT',
					body: publishFormData,
					credentials: 'include'
				});

				if (!publishResponse.ok) {
					const errorData = await publishResponse.json();
					console.warn('Failed to publish lesson:', errorData.error);
				}
			}

			success = publishImmediately ? 'Lesson created and published successfully!' : 'Lesson created successfully!';
			
			// Redirect to lessons list after a short delay
			setTimeout(() => {
				goto(`/instructor/courses/${courseId}/lessons`);
			}, 1500);

		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create lesson';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>New Lesson - {course?.title || 'Course'} | NaijaLingua</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	{#if loading}
		<div class="flex justify-center items-center min-h-[200px]">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
		</div>
	{:else}
		<!-- Header -->
		<div class="mb-8">
			<nav class="flex items-center space-x-2 text-sm text-gray-500 mb-2">
				<a href="/instructor/courses" class="hover:text-gray-700">Courses</a>
				<span>/</span>
				<a href="/instructor/courses/{courseId}" class="hover:text-gray-700">{course?.title}</a>
				<span>/</span>
				<a href="/instructor/courses/{courseId}/lessons" class="hover:text-gray-700">Lessons</a>
				<span>/</span>
				<span class="text-gray-900">New Lesson</span>
			</nav>
			<h1 class="text-3xl font-bold text-gray-900">Create New Lesson</h1>
			<p class="text-gray-600 mt-2">Add a new lesson to "{course?.title}"</p>
		</div>

		{#if error}
			<div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
				<div class="flex">
					<div class="ml-3">
						<h3 class="text-sm font-medium text-red-800">Error</h3>
						<div class="mt-2 text-sm text-red-700">
							<p>{error}</p>
						</div>
					</div>
				</div>
			</div>
		{/if}

		{#if success}
			<div class="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
				<div class="flex">
					<div class="ml-3">
						<h3 class="text-sm font-medium text-green-800">Success</h3>
						<div class="mt-2 text-sm text-green-700">
							<p>{success}</p>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<form on:submit|preventDefault={() => handleSubmit(false)} class="space-y-8">
			<div class="bg-white shadow-sm rounded-lg">
				<div class="px-6 py-4 border-b border-gray-200">
					<h2 class="text-lg font-medium text-gray-900">Basic Information</h2>
				</div>
				<div class="px-6 py-4 space-y-6">
					<!-- Title -->
					<div>
						<label for="title" class="block text-sm font-medium text-gray-700">
							Lesson Title *
						</label>
						<input
							type="text"
							id="title"
							bind:value={title}
							required
							class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							placeholder="Enter lesson title"
						/>
					</div>

					<!-- Description -->
					<div>
						<label for="description" class="block text-sm font-medium text-gray-700">
							Description
						</label>
						<textarea
							id="description"
							bind:value={description}
							rows="3"
							class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							placeholder="Brief description of the lesson"
						></textarea>
					</div>

					<!-- Order -->
					<div>
						<label for="order" class="block text-sm font-medium text-gray-700">
							Lesson Order
						</label>
						<input
							type="number"
							id="order"
							bind:value={order}
							min="1"
							class="mt-1 block w-32 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						/>
						<p class="mt-1 text-sm text-gray-500">The order in which this lesson appears in the course</p>
					</div>
				</div>
			</div>

			<!-- Content -->
			<div class="bg-white shadow-sm rounded-lg">
				<div class="px-6 py-4 border-b border-gray-200">
					<h2 class="text-lg font-medium text-gray-900">Lesson Content</h2>
				</div>
				<div class="px-6 py-4">
					<label for="contentHtml" class="block text-sm font-medium text-gray-700">
						Content (HTML)
					</label>
					<textarea
						id="contentHtml"
						bind:value={contentHtml}
						rows="10"
						class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
						placeholder="Enter lesson content in HTML format"
					></textarea>
					<p class="mt-1 text-sm text-gray-500">You can use HTML tags to format your content</p>
				</div>
			</div>

			<!-- Media Files -->
			<div class="bg-white shadow-sm rounded-lg">
				<div class="px-6 py-4 border-b border-gray-200">
					<h2 class="text-lg font-medium text-gray-900">Media Files</h2>
				</div>
				<div class="px-6 py-4 space-y-6">
					<!-- Image Upload -->
					<div>
						<label for="image" class="block text-sm font-medium text-gray-700">
							Lesson Image
						</label>
						<div class="mt-1">
							{#if imagePreview}
								<div class="relative inline-block">
									<img src={imagePreview} alt="Preview" class="w-32 h-24 object-cover rounded-lg border border-gray-300" />
									<button
										type="button"
										on:click={removeImage}
										class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
									>
										<X class="w-4 h-4" />
									</button>
								</div>
							{:else}
								<div class="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400">
									<div class="space-y-1 text-center">
										<Image class="mx-auto h-12 w-12 text-gray-400" />
										<div class="flex text-sm text-gray-600">
											<label for="image" class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
												<span>Upload an image</span>
												<input
													id="image"
													type="file"
													accept="image/*"
													class="sr-only"
													on:change={handleImageChange}
												/>
											</label>
											<p class="pl-1">or drag and drop</p>
										</div>
										<p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
									</div>
								</div>
							{/if}
						</div>
					</div>

					<!-- Video Upload -->
					<div>
						<label for="video" class="block text-sm font-medium text-gray-700">
							Lesson Video
						</label>
						<div class="mt-1">
							{#if videoPreview}
								<div class="relative inline-block">
									<video src={videoPreview} class="w-64 h-36 object-cover rounded-lg border border-gray-300" controls />
									<button
										type="button"
										on:click={removeVideo}
										class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
									>
										<X class="w-4 h-4" />
									</button>
								</div>
							{:else}
								<div class="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400">
									<div class="space-y-1 text-center">
										<Video class="mx-auto h-12 w-12 text-gray-400" />
										<div class="flex text-sm text-gray-600">
											<label for="video" class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
												<span>Upload a video</span>
												<input
													id="video"
													type="file"
													accept="video/*"
													class="sr-only"
													on:change={handleVideoChange}
												/>
											</label>
											<p class="pl-1">or drag and drop</p>
										</div>
										<p class="text-xs text-gray-500">MP4, WebM, AVI up to 100MB</p>
									</div>
								</div>
							{/if}
						</div>
					</div>

					<!-- Audio Upload -->
					<div>
						<label for="audio" class="block text-sm font-medium text-gray-700">
							Lesson Audio
						</label>
						<div class="mt-1">
							{#if audioPreview}
								<div class="relative inline-block">
									<audio src={audioPreview} class="w-64" controls />
									<button
										type="button"
										on:click={removeAudio}
										class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
									>
										<X class="w-4 h-4" />
									</button>
								</div>
							{:else}
								<div class="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400">
									<div class="space-y-1 text-center">
										<FileAudio class="mx-auto h-12 w-12 text-gray-400" />
										<div class="flex text-sm text-gray-600">
											<label for="audio" class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
												<span>Upload an audio file</span>
												<input
													id="audio"
													type="file"
													accept="audio/*"
													class="sr-only"
													on:change={handleAudioChange}
												/>
											</label>
											<p class="pl-1">or drag and drop</p>
										</div>
										<p class="text-xs text-gray-500">MP3, WAV, OGG up to 50MB</p>
									</div>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<!-- Actions -->
			<div class="flex items-center justify-between pt-6 border-t border-gray-200">
				<a
					href="/instructor/courses/{courseId}/lessons"
					class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
				>
					Cancel
				</a>
				
				<div class="flex items-center space-x-3">
					<button
						type="submit"
						disabled={submitting}
						class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
					>
						<Save class="w-4 h-4 mr-2" />
						{submitting ? 'Creating...' : 'Save as Draft'}
					</button>
					
					<button
						type="button"
						on:click={() => handleSubmit(true)}
						disabled={submitting}
						class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
					>
						<Eye class="w-4 h-4 mr-2" />
						{submitting ? 'Publishing...' : 'Save & Publish'}
					</button>
				</div>
			</div>
		</form>
	{/if}
</div>
