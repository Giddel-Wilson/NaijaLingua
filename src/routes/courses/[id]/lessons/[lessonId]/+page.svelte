<script lang="ts">
	import { BookOpen, Clock, ArrowLeft, ArrowRight, CheckCircle, Award, Play } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

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
					const shouldContinue = confirm('Lesson completed! Would you like to continue to the next lesson?');
					if (shouldContinue) {
						goto(`/courses/${data.courseId}/lessons/${data.nextLesson.id}`);
					}
				} else {
					// Course completed
					alert('Congratulations! You have completed this course!');
					goto(`/courses/${data.courseId}`);
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
		@apply text-gray-900 leading-7;
	}
	
	:global(.prose h1) {
		@apply text-2xl font-bold text-gray-900 mb-4;
	}
	
	:global(.prose h2) {
		@apply text-xl font-semibold text-gray-900 mb-3 mt-6;
	}
	
	:global(.prose h3) {
		@apply text-lg font-medium text-gray-900 mb-2 mt-4;
	}
	
	:global(.prose p) {
		@apply mb-4;
	}
	
	:global(.prose ul, .prose ol) {
		@apply mb-4 pl-6;
	}
	
	:global(.prose li) {
		@apply mb-1;
	}
	
	:global(.prose strong) {
		@apply font-semibold text-gray-900;
	}
	
	:global(.prose em) {
		@apply italic;
	}
	
	:global(.prose code) {
		@apply bg-gray-100 text-gray-900 px-1 py-0.5 rounded text-sm;
	}
	
	:global(.prose pre) {
		@apply bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4;
	}
	
	:global(.prose blockquote) {
		@apply border-l-4 border-gray-300 pl-4 italic text-gray-700 mb-4;
	}
</style>
