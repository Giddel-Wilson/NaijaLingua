<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Plus, Edit, Trash2, HelpCircle, CheckCircle, X } from 'lucide-svelte';

	let course: any = null;
	let lesson: any = null;
	let quizzes: any[] = [];
	let loading = true;
	let error = '';
	let showCreateForm = false;

	// Create form data
	let newQuiz = {
		type: 'MULTIPLE_CHOICE',
		question: '',
		options: [],
		correctAnswer: '',
		explanation: '',
		points: 10,
		order: 1
	};

	const courseId = $page.params.id;
	const lessonId = $page.params.lessonId;

	const quizTypes = [
		{ value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
		{ value: 'TRUE_FALSE', label: 'True/False' },
		{ value: 'DRAG_DROP', label: 'Drag & Drop' },
		{ value: 'AUDIO_MATCH', label: 'Audio Match' }
	];

	onMount(async () => {
		await Promise.all([fetchCourse(), fetchLesson(), fetchQuizzes()]);
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

	async function fetchLesson() {
		try {
			const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}`, {
				credentials: 'include'
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to fetch lesson');
			}

			lesson = await response.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to fetch lesson';
		}
	}

	async function fetchQuizzes() {
		try {
			const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/quizzes`, {
				credentials: 'include'
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to fetch quizzes');
			}

			quizzes = await response.json();
			newQuiz.order = quizzes.length + 1;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to fetch quizzes';
		}
	}

	async function createQuiz() {
		if (!newQuiz.question.trim()) {
			error = 'Please enter a question';
			return;
		}

		if (!newQuiz.correctAnswer.trim()) {
			error = 'Please enter the correct answer';
			return;
		}

		try {
			const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/quizzes`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(newQuiz),
				credentials: 'include'
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to create quiz');
			}

			const quiz = await response.json();
			quizzes = [...quizzes, quiz];
			
			// Reset form
			newQuiz = {
				type: 'MULTIPLE_CHOICE',
				question: '',
				options: [],
				correctAnswer: '',
				explanation: '',
				points: 10,
				order: quizzes.length + 1
			};
			
			showCreateForm = false;
			error = '';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create quiz';
		}
	}

	async function deleteQuiz(quizId: string) {
		if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
			return;
		}

		try {
			const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/quizzes/${quizId}`, {
				method: 'DELETE',
				credentials: 'include'
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to delete quiz');
			}

			// Remove quiz from local state
			quizzes = quizzes.filter(quiz => quiz.id !== quizId);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete quiz';
		}
	}

	function addOption() {
		newQuiz.options = [...newQuiz.options, ''];
	}

	function removeOption(index: number) {
		newQuiz.options = newQuiz.options.filter((_, i) => i !== index);
	}

	function updateOption(index: number, value: string) {
		newQuiz.options[index] = value;
	}

	function getQuizTypeLabel(type: string): string {
		return quizTypes.find(t => t.value === type)?.label || type;
	}
</script>

<svelte:head>
	<title>Quiz Management - {lesson?.title || 'Lesson'} | NaijaLingua</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	{#if loading}
		<div class="flex justify-center items-center min-h-[200px]">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
		</div>
	{:else if error}
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

	<!-- Header -->
	<div class="flex justify-between items-start mb-8">
		<div>
			<nav class="flex items-center space-x-2 text-sm text-gray-500 mb-2">
				<a href="/instructor/courses" class="hover:text-gray-700">Courses</a>
				<span>/</span>
				<a href="/instructor/courses/{courseId}" class="hover:text-gray-700">{course?.title}</a>
				<span>/</span>
				<a href="/instructor/courses/{courseId}/lessons" class="hover:text-gray-700">Lessons</a>
				<span>/</span>
				<span class="text-gray-900">{lesson?.title} - Quizzes</span>
			</nav>
			<h1 class="text-3xl font-bold text-gray-900">Quiz Management</h1>
			<p class="text-gray-600 mt-2">Manage quizzes for "{lesson?.title}"</p>
		</div>
		<button
			on:click={() => showCreateForm = !showCreateForm}
			class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
		>
			<Plus class="w-4 h-4 mr-2" />
			Add Quiz
		</button>
	</div>

	<!-- Create Quiz Form -->
	{#if showCreateForm}
		<div class="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mb-8">
			<h2 class="text-lg font-medium text-gray-900 mb-4">Create New Quiz</h2>
			
			<div class="space-y-4">
				<!-- Quiz Type -->
				<div>
					<label for="quizType" class="block text-sm font-medium text-gray-700">Quiz Type</label>
					<select
						id="quizType"
						bind:value={newQuiz.type}
						class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
					>
						{#each quizTypes as type}
							<option value={type.value}>{type.label}</option>
						{/each}
					</select>
				</div>

				<!-- Question -->
				<div>
					<label for="question" class="block text-sm font-medium text-gray-700">Question *</label>
					<textarea
						id="question"
						bind:value={newQuiz.question}
						rows="3"
						class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						placeholder="Enter your quiz question"
					></textarea>
				</div>

				<!-- Options (for Multiple Choice) -->
				{#if newQuiz.type === 'MULTIPLE_CHOICE'}
					<div>
						<label class="block text-sm font-medium text-gray-700">Options</label>
						<div class="mt-2 space-y-2">
							{#each newQuiz.options as option, index}
								<div class="flex items-center space-x-2">
									<input
										type="text"
										bind:value={option}
										on:input={(e) => updateOption(index, e.target.value)}
										class="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										placeholder="Option {index + 1}"
									/>
									<button
										type="button"
										on:click={() => removeOption(index)}
										class="text-red-600 hover:text-red-800"
									>
										<X class="w-4 h-4" />
									</button>
								</div>
							{/each}
							<button
								type="button"
								on:click={addOption}
								class="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
							>
								<Plus class="w-4 h-4 mr-1" />
								Add Option
							</button>
						</div>
					</div>
				{/if}

				<!-- Correct Answer -->
				<div>
					<label for="correctAnswer" class="block text-sm font-medium text-gray-700">Correct Answer *</label>
					<input
						type="text"
						id="correctAnswer"
						bind:value={newQuiz.correctAnswer}
						class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						placeholder="Enter the correct answer"
					/>
				</div>

				<!-- Explanation -->
				<div>
					<label for="explanation" class="block text-sm font-medium text-gray-700">Explanation (Optional)</label>
					<textarea
						id="explanation"
						bind:value={newQuiz.explanation}
						rows="2"
						class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						placeholder="Explain why this is the correct answer"
					></textarea>
				</div>

				<!-- Points & Order -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="points" class="block text-sm font-medium text-gray-700">Points</label>
						<input
							type="number"
							id="points"
							bind:value={newQuiz.points}
							min="1"
							class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						/>
					</div>
					<div>
						<label for="order" class="block text-sm font-medium text-gray-700">Order</label>
						<input
							type="number"
							id="order"
							bind:value={newQuiz.order}
							min="1"
							class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						/>
					</div>
				</div>

				<!-- Actions -->
				<div class="flex items-center justify-end space-x-3 pt-4 border-t">
					<button
						type="button"
						on:click={() => showCreateForm = false}
						class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						type="button"
						on:click={createQuiz}
						class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
					>
						Create Quiz
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Quizzes List -->
	{#if quizzes.length === 0}
		<div class="text-center py-12">
			<HelpCircle class="mx-auto h-12 w-12 text-gray-400" />
			<h3 class="mt-2 text-sm font-medium text-gray-900">No quizzes</h3>
			<p class="mt-1 text-sm text-gray-500">Get started by creating your first quiz for this lesson.</p>
			<div class="mt-6">
				<button
					on:click={() => showCreateForm = true}
					class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
				>
					<Plus class="w-4 h-4 mr-2" />
					Add Quiz
				</button>
			</div>
		</div>
	{:else}
		<div class="space-y-4">
			{#each quizzes.sort((a, b) => a.order - b.order) as quiz (quiz.id)}
				<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<div class="flex items-start justify-between">
						<div class="flex-1 min-w-0">
							<div class="flex items-center space-x-3 mb-2">
								<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
									Quiz {quiz.order}
								</span>
								<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
									{getQuizTypeLabel(quiz.type)}
								</span>
								<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
									{quiz.points} pts
								</span>
							</div>
							
							<h3 class="text-lg font-medium text-gray-900 mb-2">{quiz.question}</h3>
							
							{#if quiz.explanation}
								<p class="text-gray-600 text-sm mb-3">
									<strong>Explanation:</strong> {quiz.explanation}
								</p>
							{/if}

							<div class="flex items-center text-sm text-green-600">
								<CheckCircle class="w-4 h-4 mr-1" />
								Correct Answer: {quiz.correctAnswer}
							</div>
						</div>

						<div class="flex items-center space-x-2 ml-4">
							<button
								class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
							>
								<Edit class="w-4 h-4 mr-1" />
								Edit
							</button>
							
							<button
								on:click={() => deleteQuiz(quiz.id)}
								class="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
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
</div>
