<script lang="ts">
	import { BookOpen, Clock, Users, Award, Play, CheckCircle, ArrowLeft, Lock, ChevronRight } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function getProgressPercentage() {
		if (!data.course.lessons.length) return 0;
		const completedLessons = data.lessonProgress.filter(p => p.completed).length;
		return Math.round((completedLessons / data.course.lessons.length) * 100);
	}

	function isLessonCompleted(lessonId: string) {
		return data.lessonProgress.some(p => p.lessonId === lessonId && p.completed);
	}

	function isLessonUnlocked(lessonIndex: number) {
		// First lesson is always unlocked
		if (lessonIndex === 0) return true;
		
		// Check if previous lesson is completed
		const previousLesson = data.course.lessons[lessonIndex - 1];
		return isLessonCompleted(previousLesson.id);
	}

	function startLesson(lessonId: string) {
		goto(`/courses/${data.course.id}/lessons/${lessonId}`);
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

	function getLanguageFlag(language: string) {
		const flags: Record<string, string> = {
			YORUBA: '🟢',
			IGBO: '🔵',
			HAUSA: '🟡',
			PIDGIN: '🟠',
			EDO: '🟣',
			FULANI: '🔴',
			KANURI: '⚪',
			TIV: '🟤'
		};
		return flags[language] || '🌍';
	}
</script>

<svelte:head>
	<title>{data.course.title} - NaijaLingua</title>
</svelte:head>

<div class="p-6">
	<!-- Back Navigation -->
	<div class="mb-6">
		<button 
			onclick={() => goto('/dashboard/courses')}
			class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
		>
			<ArrowLeft class="h-4 w-4 mr-1" />
			Back to My Courses
		</button>
	</div>

	<!-- Course Header -->
	<div class="bg-white rounded-xl border border-gray-200 p-6 mb-8">
		<div class="flex items-start justify-between">
			<div class="flex-1">
				<div class="flex items-center mb-4">
					<div class="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
						<span class="text-xl">
							{getLanguageFlag(data.course.language)}
						</span>
					</div>
					<div>
						<h1 class="text-2xl font-bold text-gray-900">{data.course.title}</h1>
						<p class="text-gray-600">By {data.course.createdBy.name}</p>
					</div>
				</div>
				
				{#if data.course.description}
					<p class="text-gray-700 mb-4">{data.course.description}</p>
				{/if}

				<div class="flex items-center space-x-6 text-sm text-gray-600">
					<span class="flex items-center">
						<BookOpen class="h-4 w-4 mr-1" />
						{data.course.lessons.length} lessons
					</span>
					<span class="flex items-center">
						<Users class="h-4 w-4 mr-1" />
						{data.course._count.enrollments} students
					</span>
					<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border {getLevelColor(data.course.level)}">
						{data.course.level}
					</span>
				</div>
			</div>

			<!-- Progress Card -->
			<div class="ml-8 bg-gray-50 rounded-lg p-4 min-w-[200px]">
				<div class="text-center">
					<div class="text-2xl font-bold text-gray-900 mb-1">
						{getProgressPercentage()}%
					</div>
					<p class="text-sm text-gray-600 mb-3">Complete</p>
					<div class="w-full bg-gray-200 rounded-full h-2">
						<div 
							class="bg-green-600 h-2 rounded-full transition-all duration-300"
							style="width: {getProgressPercentage()}%"
						></div>
					</div>
					<p class="text-xs text-gray-500 mt-2">
						Started {formatDate(data.enrollment.startedAt)}
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Lessons List -->
	<div class="bg-white rounded-xl border border-gray-200 p-6">
		<div class="flex items-center justify-between mb-6">
			<h2 class="text-lg font-semibold text-gray-900">Course Lessons</h2>
			<span class="text-sm text-gray-600">
				{data.lessonProgress.filter(p => p.completed).length} of {data.course.lessons.length} completed
			</span>
		</div>

		{#if data.course.lessons.length > 0}
			<div class="space-y-3">
				{#each data.course.lessons as lesson, index}
					{@const isCompleted = isLessonCompleted(lesson.id)}
					{@const isUnlocked = isLessonUnlocked(index)}
					<div class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
						<!-- Lesson Status Icon -->
						<div class="flex-shrink-0 w-8 h-8 mr-4">
							{#if isCompleted}
								<div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
									<CheckCircle class="h-5 w-5 text-white" />
								</div>
							{:else if isUnlocked}
								<div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
									<Play class="h-4 w-4 text-gray-600" />
								</div>
							{:else}
								<div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
									<Lock class="h-4 w-4 text-gray-400" />
								</div>
							{/if}
						</div>

						<!-- Lesson Info -->
						<div class="flex-1">
							<h3 class="font-medium text-gray-900 mb-1">{lesson.title}</h3>
							{#if lesson.description}
								<p class="text-sm text-gray-600 mb-2">{lesson.description}</p>
							{/if}
							<div class="flex items-center text-xs text-gray-500">
								<span>Lesson {index + 1}</span>
								{#if lesson.quizzes.length > 0}
									<span class="ml-4 flex items-center">
										<Award class="h-3 w-3 mr-1" />
										{lesson.quizzes.length} quiz{lesson.quizzes.length !== 1 ? 'es' : ''}
									</span>
								{/if}
							</div>
						</div>

						<!-- Action Button -->
						<div class="flex-shrink-0">
							{#if isUnlocked}
								<button
									onclick={() => startLesson(lesson.id)}
									class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors
										{isCompleted 
											? 'text-green-700 bg-green-50 hover:bg-green-100 border border-green-200' 
											: 'text-white bg-green-600 hover:bg-green-700'}"
								>
									{#if isCompleted}
										Review
									{:else}
										{index === 0 || isLessonCompleted(data.course.lessons[index - 1].id) ? 'Start' : 'Continue'}
									{/if}
									<ChevronRight class="h-4 w-4 ml-1" />
								</button>
							{:else}
								<span class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed">
									<Lock class="h-4 w-4 mr-1" />
									Locked
								</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="text-center py-8">
				<BookOpen class="h-12 w-12 text-gray-400 mx-auto mb-4" />
				<h3 class="text-lg font-medium text-gray-900 mb-2">No lessons yet</h3>
				<p class="text-gray-600">Lessons will appear here once the instructor adds them.</p>
			</div>
		{/if}
	</div>
</div>
