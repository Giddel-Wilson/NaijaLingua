<script lang="ts">
	import { BookOpen, Clock, ArrowLeft, ArrowRight, CheckCircle, Award, Play } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import AlertModal from '$lib/components/AlertModal.svelte';
	import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
	import type { PageData } from './$types';

		let isCompleting = $state(false);
	let completionError = $state('');
	let showContinueModal = $state(false);
	let showCongratsModal = $state(false);

	const { data }: { data: PageData } = $props();

	let startTime: number;

	onMount(() => {
		startTime = Date.now();

		// Track time spent when user leaves the page
		return () => {
			if (startTime) {
				const timeSpent = Math.floor((Date.now() - startTime) / 1000);
				updateTimeSpent(timeSpent);
			}
		};
	});

	async function updateTimeSpent(additionalTime: number) {
		try {
			await fetch(`/api/lessons/${data.lesson.id}/progress`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					timeSpent: additionalTime
				})
			});
		} catch (error) {
			console.error('Failed to update time spent:', error);
		}
	}

	async function markAsCompleted() {
		try {
			const response = await fetch(`/api/lessons/${data.lesson.id}/complete`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (response.ok) {
				// Update local state
				data.lessonProgress.completed = true;
				
				// If there's a next lesson, offer to continue
				if (data.nextLesson) {
					showContinueModal = true;
				} else {
					// Course completed
					showCongratsModal = true;
				}
			}
		} catch (error) {
			console.error('Failed to mark lesson as completed:', error);
		}
	}

	function goToQuiz(quizId: string) {
		goto(`/courses/${data.courseId}/lessons/${data.lesson.id}/quiz/${quizId}`);
	}

	function formatTime(seconds: number) {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;

		if (hours > 0) {
			return `${hours}h ${minutes}m ${secs}s`;
		} else if (minutes > 0) {
			return `${minutes}m ${secs}s`;
		} else {
			return `${secs}s`;
		}
	}
</script>

<svelte:head>
	<title>{data.lesson.title} - {data.lesson.course.title} | NaijaLingua</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<div class="bg-white border-b border-gray-200 px-6 py-4">
		<div class="flex items-center justify-between">
			<div class="flex items-center">
				<button 
					onclick={() => goto(`/courses/${data.courseId}`)}
					class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mr-4"
				>
					<ArrowLeft class="h-4 w-4 mr-1" />
					Back to Course
				</button>
				<div>
					<h1 class="text-lg font-semibold text-gray-900">{data.lesson.title}</h1>
					<p class="text-sm text-gray-600">{data.lesson.course.title}</p>
				</div>
			</div>

			{#if !data.lessonProgress.completed}
				<button
					onclick={markAsCompleted}
					class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
				>
					<CheckCircle class="h-4 w-4 mr-2" />
					Mark as Complete
				</button>
			{:else}
				<div class="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg border border-green-200">
					<CheckCircle class="h-4 w-4 mr-2" />
					Completed
				</div>
			{/if}
		</div>
	</div>

	<div class="max-w-4xl mx-auto p-6">
		<!-- Lesson Content -->
		<div class="bg-white rounded-xl border border-gray-200 p-8 mb-8">
			{#if data.lesson.content}
				<div class="prose max-w-none">
					{@html data.lesson.content}
				</div>
			{:else}
				<div class="text-center py-12">
					<BookOpen class="h-16 w-16 text-gray-400 mx-auto mb-4" />
					<h3 class="text-xl font-semibold text-gray-900 mb-2">Lesson Content</h3>
					<p class="text-gray-600">Lesson content will be displayed here once added by the instructor.</p>
				</div>
			{/if}
		</div>

		<!-- Quizzes Section -->
		{#if data.lesson.quizzes.length > 0}
			<div class="bg-white rounded-xl border border-gray-200 p-6 mb-8">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-lg font-semibold text-gray-900">Practice Quizzes</h2>
					<span class="text-sm text-gray-600">{data.lesson.quizzes.length} quiz{data.lesson.quizzes.length !== 1 ? 'es' : ''} available</span>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					{#each data.lesson.quizzes as quiz}
						{@const attempt = data.quizAttempts.find(a => a.quizId === quiz.id)}
						<div class="border border-gray-200 rounded-lg p-4">
							<div class="flex items-start justify-between mb-3">
								<div>
									<h3 class="font-medium text-gray-900">{quiz.title}</h3>
									{#if quiz.description}
										<p class="text-sm text-gray-600 mt-1">{quiz.description}</p>
									{/if}
								</div>
								<div class="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
									<Award class="h-5 w-5 text-orange-600" />
								</div>
							</div>

							<div class="flex items-center justify-between text-sm text-gray-600 mb-3">
								<span>{quiz.questions.length} questions</span>
								{#if attempt}
									<span class="text-green-600 font-medium">Score: {attempt.score}%</span>
								{/if}
							</div>

							<button
								onclick={() => goToQuiz(quiz.id)}
								class="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 transition-colors"
							>
								<Play class="h-4 w-4 mr-2" />
								{attempt ? 'Retake Quiz' : 'Start Quiz'}
							</button>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Progress Info -->
		<div class="bg-white rounded-xl border border-gray-200 p-6 mb-8">
			<h3 class="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div class="text-center">
					<div class="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-2">
						<CheckCircle class="h-6 w-6 text-green-600" />
					</div>
					<p class="text-sm font-medium text-gray-900">Status</p>
					<p class="text-sm text-gray-600">
						{data.lessonProgress.completed ? 'Completed' : 'In Progress'}
					</p>
				</div>
				<div class="text-center">
					<div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-2">
						<Clock class="h-6 w-6 text-blue-600" />
					</div>
					<p class="text-sm font-medium text-gray-900">Time Spent</p>
					<p class="text-sm text-gray-600">
						{formatTime(data.lessonProgress.timeSpent)}
					</p>
				</div>
				<div class="text-center">
					<div class="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-2">
						<Award class="h-6 w-6 text-purple-600" />
					</div>
					<p class="text-sm font-medium text-gray-900">Quizzes</p>
					<p class="text-sm text-gray-600">
						{data.quizAttempts.length} of {data.lesson.quizzes.length} attempted
					</p>
				</div>
			</div>
		</div>

		<!-- Navigation -->
		<div class="flex items-center justify-between">
			{#if data.previousLesson}
				<a
					href="/courses/{data.courseId}/lessons/{data.previousLesson.id}"
					class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
				>
					<ArrowLeft class="h-4 w-4 mr-2" />
					Previous: {data.previousLesson.title}
				</a>
			{:else}
				<div></div>
			{/if}

			{#if data.nextLesson}
				<a
					href="/courses/{data.courseId}/lessons/{data.nextLesson.id}"
					class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
				>
					Next: {data.nextLesson.title}
					<ArrowRight class="h-4 w-4 ml-2" />
				</a>
			{:else}
				<a
					href="/courses/{data.courseId}"
					class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
				>
					Back to Course
					<ArrowRight class="h-4 w-4 ml-2" />
				</a>
			{/if}
		</div>
	</div>
</div>

<style>
	:global(.prose) {
		color: var(--color-gray-900);
		line-height: 1.75;
	}
	
	:global(.prose h1) {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-gray-900);
		margin-bottom: 1rem;
	}
	
	:global(.prose h2) {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-gray-900);
		margin-bottom: 0.75rem;
		margin-top: 1.5rem;
	}
	
	:global(.prose h3) {
		font-size: 1.125rem;
		font-weight: 500;
		color: var(--color-gray-900);
		margin-bottom: 0.5rem;
		margin-top: 1rem;
	}
	
	:global(.prose p) {
		margin-bottom: 1rem;
	}
	
	:global(.prose ul, .prose ol) {
		margin-bottom: 1rem;
		padding-left: 1.5rem;
	}
	
	:global(.prose li) {
		margin-bottom: 0.25rem;
	}
	
	:global(.prose strong) {
		font-weight: 600;
		color: var(--color-gray-900);
	}
	
	:global(.prose em) {
		font-style: italic;
	}
	
	:global(.prose code) {
		background-color: var(--color-gray-100);
		color: var(--color-gray-900);
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		font-size: 0.875rem;
	}
	
	:global(.prose pre) {
		background-color: var(--color-gray-100);
		padding: 1rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		margin-bottom: 1rem;
	}
	
	:global(.prose blockquote) {
		border-left: 4px solid var(--color-gray-300);
		padding-left: 1rem;
		font-style: italic;
		color: var(--color-gray-700);
		margin-bottom: 1rem;
	}
</style>

<!-- Continue to Next Lesson Modal -->
<ConfirmationModal
	bind:isOpen={showContinueModal}
	title="Lesson Completed!"
	message="Would you like to continue to the next lesson?"
	confirmText="Continue"
	cancelText="Stay Here"
	variant="info"
	onConfirm={() => goto(`/courses/${data.courseId}/lessons/${data.nextLesson?.id}`)}
	onCancel={() => {}}
/>

<!-- Course Completed Modal -->
<AlertModal
	bind:isOpen={showCongratsModal}
	title="Congratulations!"
	message="You have completed this course!"
	type="success"
	buttonText="View Course"
	onClose={() => goto(`/courses/${data.courseId}`)}
/>
