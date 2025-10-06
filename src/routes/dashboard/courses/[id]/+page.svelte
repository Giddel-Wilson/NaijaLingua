<script lang="ts">
	import { 
		BookOpen, 
		Clock, 
		Users, 
		Award, 
		Play, 
		CheckCircle, 
		ArrowLeft, 
		ArrowRight,
		RotateCcw,
		Home,
		ChevronLeft,
		ChevronRight,
		Volume2,
		Check,
		X
	} from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import AlertModal from '$lib/components/AlertModal.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let startTime: number;
	
	// Alert modal state
	let showAlertModal = $state(false);
	let alertMessage = $state('');
	let alertTitle = $state('');
	let alertType = $state<'success' | 'error' | 'info' | 'warning'>('info');
	
	// Quiz state
	let currentQuizIndex = $state(0);
	let selectedAnswer = $state('');
	let quizSubmitted = $state(false);
	let quizCorrect = $state(false);
	let showQuizResult = $state(false);
	let wordsReviewed = $state(0);
	
	// Quiz modal state
	let showQuizModal = $state(false);
	let quizAnswers = $state<string[]>([]); // Store all answers
	let currentQuestionIndex = $state(0);
	let timeRemaining = $state(0);
	let timerInterval = $state<NodeJS.Timeout | null>(null);
	let quizCompleted = $state(false);
	let quizStartTime = $state(0);
	
	// Course completion modal state
	let showCourseCompletionModal = $state(false);
	
	// Quiz scoring state - Initialize from server data (80% pass system)
	let quizScore = $state(0);
	let quizPassed = $state(data.quizStatus?.hasPassed === true); // Explicit boolean check
	let totalAttempts = $state(data.quizStatus?.totalAttempts || 0);
	let bestScore = $state(data.quizStatus?.bestScore || 0);
	let canTakeQuiz = $state(data.quizStatus?.canTakeQuiz ?? true);
	let quizResults = $state<any[]>([]);
	let quizStatusLoaded = $state(true);  // No need to load from API anymore
	
	// Word navigation state
	let wordIndex = $state(0);
	let isShowingDefinition = $state(false);

	// Get current lesson quizzes
	let currentQuizzes = $derived(data.currentLesson?.quizzes || []);
	let hasQuizzes = $derived(currentQuizzes.length > 0);
	let currentQuiz = $derived(currentQuizzes[currentQuizIndex]);
	
	// Check if current session is locked (previous sessions not completed)
	let isSessionLocked = $derived(() => {
		if (data.currentSession === 1) return false; // First session is never locked
		
		// Check if all previous sessions are completed
		for (let i = 0; i < data.currentSession - 1; i++) {
			const lessonId = data.course.lessons[i]?.id;
			const progress = data.lessonProgress.find(p => p.lessonId === lessonId);
			if (!progress || !progress.completed) {
				return true;
			}
		}
		return false;
	});

	// Calculate words reviewed from vocabulary
	let vocabularyWords = $derived(() => {
		if (!data.currentLesson?.contentHtml) return [];
		try {
			const lessonData = JSON.parse(data.currentLesson.contentHtml);
			return lessonData.vocabulary || [];
		} catch {
			return [];
		}
	});

	// Handle empty course case
	if (data.isEmpty) {
		// Show empty course message - don't initialize functions that depend on lesson data
	} else {
		// Only initialize learning functions if we have lesson data
	}

	// Parse quiz options - handle both JSON array and comma-separated string formats
	function parseQuizOptions(options: any): string[] {
		if (!options) return [];
		
		// If it's already an array, return it
		if (Array.isArray(options)) {
			return options.map(option => String(option));
		}
		
		// Convert to string if it's not already
		const optionsStr = String(options);
		
		try {
			// Try parsing as JSON first
			const parsed = JSON.parse(optionsStr);
			if (Array.isArray(parsed)) {
				return parsed.map(option => String(option));
			}
		} catch (e) {
			// If JSON parsing fails, treat as comma-separated string
		}
		
		// Fall back to comma-separated parsing
		return optionsStr.split(',').map(option => option.trim()).filter(option => option.length > 0);
	}

	onMount(() => {
		startTime = Date.now();
		
		// Initialize quiz state from server data (80% pass system)
		if (data.quizStatus) {
			totalAttempts = data.quizStatus.totalAttempts;
			bestScore = data.quizStatus.bestScore;
			canTakeQuiz = data.quizStatus.canTakeQuiz;
			quizPassed = data.quizStatus.hasPassed;
		}

		return () => {
			if (startTime) {
				const timeSpent = Math.floor((Date.now() - startTime) / 1000);
				updateTimeSpent(timeSpent);
			}
		};
	});

	async function updateTimeSpent(additionalTime: number) {
		if (!data.currentLesson) return;
		
		try {
			await fetch(`/api/lessons/${data.currentLesson.id}/progress`, {
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

	async function markSessionComplete() {
		if (!data.currentLesson) return;
		
		// If there are quizzes, don't allow completion until quizzes are done
		if (hasQuizzes && currentQuizIndex < currentQuizzes.length) {
			alertTitle = 'Quizzes Required';
			alertMessage = 'Please complete all quizzes before finishing this session.';
			alertType = 'warning';
			showAlertModal = true;
			return;
		}
		
		try {
			const response = await fetch(`/api/lessons/${data.currentLesson.id}/complete`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (response.ok) {
				// Move to next session if available
				if (data.currentSession < data.totalSessions) {
					goto(`/dashboard/courses/${data.course.id}?session=${data.currentSession + 1}`);
				} else {
					// Course completed - show completion modal
					showCourseCompletionModal = true;
				}
			}
		} catch (error) {
			console.error('Failed to complete session:', error);
		}
	}

	async function submitQuiz() {
		if (!currentQuiz || !selectedAnswer || !data.currentLesson) return;
		
		try {
			const response = await fetch(`/api/lessons/${data.currentLesson.id}/quizzes/${currentQuiz.id}/submit`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					answer: selectedAnswer
				})
			});

			if (response.ok) {
				const result = await response.json();
				quizCorrect = result.correct;
				quizSubmitted = true;
				showQuizResult = true;
			}
		} catch (error) {
			console.error('Failed to submit quiz:', error);
		}
	}

	function nextQuiz() {
		if (currentQuizIndex < currentQuizzes.length - 1) {
			currentQuizIndex++;
			selectedAnswer = '';
			quizSubmitted = false;
			showQuizResult = false;
		}
	}

	// Quiz Modal Functions
	function startQuizModal() {
		if (!hasQuizzes || !canTakeQuiz) {
			if (!hasQuizzes) {
				alertTitle = 'No Quiz Available';
				alertMessage = 'No quiz is available for this lesson.';
				alertType = 'info';
			} else {
				alertTitle = 'Quiz Already Passed';
				alertMessage = 'You have already passed this quiz with 80% or higher!';
				alertType = 'success';
			}
			showAlertModal = true;
			return;
		}
		
		// Initialize quiz state
		showQuizModal = true;
		currentQuestionIndex = 0;
		quizAnswers = new Array(currentQuizzes.length).fill('');
		quizCompleted = false;
		quizStartTime = Date.now();
		
		// Set timer based on number of questions
		const questionCount = currentQuizzes.length;
		timeRemaining = questionCount < 4 ? 300 : 600; // 5 mins or 10 mins in seconds
		
		// Start countdown timer
		timerInterval = setInterval(() => {
			timeRemaining--;
			if (timeRemaining <= 0) {
				autoSubmitQuiz();
			}
		}, 1000);
	}

	function closeQuizModal() {
		showQuizModal = false;
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
	}

	function nextQuestion() {
		if (currentQuestionIndex < currentQuizzes.length - 1) {
			currentQuestionIndex++;
		}
	}

	function previousQuestion() {
		if (currentQuestionIndex > 0) {
			currentQuestionIndex--;
		}
	}

	function selectAnswer(answer: string) {
		quizAnswers[currentQuestionIndex] = answer;
	}

	async function submitQuizModal() {
		if (!data.currentLesson) return;
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}

		try {
			// Prepare answers for the new API
			const answers = currentQuizzes.map((quiz, index) => ({
				quizId: quiz.id,
				answer: quizAnswers[index] || ''
			}));

			// Submit all quiz answers at once
			const response = await fetch(`/api/lessons/${data.currentLesson.id}/quiz-submit`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					answers: answers
				})
			});

			if (response.ok) {
				const result = await response.json();
				
				// Update quiz state with results (80% pass system)
				quizScore = result.score || 0;
				quizPassed = result.passed || false;
				totalAttempts = result.totalAttempts || 1;
				bestScore = Math.max(bestScore, quizScore);
				canTakeQuiz = !result.passed; // Can retake until passed
				quizResults = result.results || [];
				
				// Show completion
				quizCompleted = true;
				
				// If quiz passed and lesson completed, prepare to navigate to next lesson
				if (result.passed && result.lessonCompleted) {
					const nextSession = data.currentSession + 1;
					const hasNextSession = nextSession <= data.totalSessions;
					
					// Auto-close modal and navigate to next lesson or stay on current
					setTimeout(() => {
						closeQuizModal();
						if (hasNextSession) {
							// Navigate to next session/lesson
							console.log(`🎉 Lesson completed! Moving to Session ${nextSession}`);
							goto(`/dashboard/courses/${data.course.id}?session=${nextSession}`);
						} else {
							// This was the last lesson, just refresh to show completion
							console.log(`🏆 Course completed! All lessons finished.`);
							window.location.reload();
						}
					}, 3000); // Reduced to 3 seconds for better UX
				} else if (result.passed) {
					// Quiz passed but lesson not marked complete (shouldn't happen)
					setTimeout(() => {
						closeQuizModal();
						window.location.reload();
					}, 5000);
				} else {
					// Quiz failed, allow retake
					setTimeout(() => {
						closeQuizModal();
					}, 3000);
				}
			} else {
				const error = await response.json();
				console.error('Quiz submission failed:', error);
			}

		} catch (error) {
			console.error('Failed to submit quiz:', error);
		}
	}

	async function autoSubmitQuiz() {
		// Called when timer runs out
		await submitQuizModal();
	}

	function closeCourseCompletionModal() {
		showCourseCompletionModal = false;
		goto('/dashboard/courses');
	}

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	function reviewWord() {
		wordsReviewed = Math.min(wordsReviewed + 1, vocabularyWords.length);
	}

	function nextWord() {
		if (wordIndex < vocabularyWords.length - 1) {
			wordIndex++;
			isShowingDefinition = false;
		}
	}

	function previousWord() {
		if (wordIndex > 0) {
			wordIndex--;
			isShowingDefinition = false;
		}
	}

	function goToSession(sessionNumber: number) {
		// Check if this session is locked
		if (sessionNumber > 1) {
			// Check if all previous sessions are completed
			for (let i = 0; i < sessionNumber - 1; i++) {
				const lessonId = data.course.lessons[i]?.id;
				const progress = data.lessonProgress.find(p => p.lessonId === lessonId);
				if (!progress || !progress.completed) {
					alertTitle = 'Session Locked';
					alertMessage = `Please complete Session ${i + 1} before accessing Session ${sessionNumber}.`;
					alertType = 'warning';
					showAlertModal = true;
					return;
				}
			}
		}
		goto(`/dashboard/courses/${data.course.id}?session=${sessionNumber}`);
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
	{#if data.isEmpty}
		<title>Course Setup Required - {data.course.title} | NaijaLingua</title>
	{:else if data.currentLesson}
		<title>Session {data.currentSession}: {data.currentLesson.title} - {data.course.title} | NaijaLingua</title>
	{:else}
		<title>{data.course.title} | NaijaLingua</title>
	{/if}
</svelte:head>

{#if data.isEmpty}
	<!-- Empty Course State -->
	<div class="p-6">
		<div class="bg-white rounded-xl border border-gray-200 p-8 text-center">
			<div class="w-16 h-16 bg-orange-50 rounded-lg flex items-center justify-center mx-auto mb-4">
				<BookOpen class="h-8 w-8 text-orange-600" />
			</div>
			<h1 class="text-2xl font-bold text-gray-900 mb-2">{data.course.title}</h1>
			<p class="text-gray-600 mb-6">This course is still being prepared. Lessons will be available soon!</p>
			
			<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
				<h3 class="font-medium text-blue-900 mb-2">Course Information</h3>
				<div class="text-sm text-blue-700 space-y-1">
					<p><strong>Language:</strong> {data.course.language}</p>
					<p><strong>Level:</strong> {data.course.level}</p>
					<p><strong>Instructor:</strong> {data.course.createdBy.name}</p>
				</div>
			</div>

			<div class="flex items-center justify-center space-x-4">
				<button
					onclick={() => goto('/dashboard/courses')}
					class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
				>
					Back to My Courses
				</button>
				
				<button
					onclick={() => window.location.reload()}
					class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
				>
					Check for Updates
				</button>
			</div>
		</div>
	</div>
{:else}
	<!-- Normal Learning Interface -->

<div class="p-6">
	<!-- Course Header with Progress -->
	<div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center">
				<button 
					onclick={() => goto('/dashboard/courses')}
					class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mr-4"
				>
					<ArrowLeft class="h-4 w-4 mr-1" />
					My Courses
				</button>
				<div class="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
					<span class="text-lg">
						{getLanguageFlag(data.course.language)}
					</span>
				</div>
				<div>
					<h1 class="text-xl font-bold text-gray-900">{data.course.title}</h1>
					<p class="text-sm text-gray-600">Session {data.currentSession} of {data.totalSessions}{data.currentLesson ? `: ${data.currentLesson.title}` : ''}</p>
				</div>
			</div>
			
			<div class="text-right">
				<div class="text-2xl font-bold text-green-600">{data.courseProgress}%</div>
				<p class="text-sm text-gray-600">Complete</p>
			</div>
		</div>

		<!-- Progress Bar -->
		<div class="w-full bg-gray-200 rounded-full h-2 mb-4">
			<div 
				class="bg-green-600 h-2 rounded-full transition-all duration-300"
				style="width: {(data.currentSession / data.totalSessions) * 100}%"
			></div>
		</div>

		<!-- Session Navigation -->
		<div class="flex items-center justify-center space-x-2">
			{#each Array(data.totalSessions) as _, index}
				{@const sessionNumber = index + 1}
				{@const lessonId = data.course.lessons[index]?.id}
				{@const isCompleted = data.lessonProgress.some(p => p.lessonId === lessonId && p.completed)}
				{@const isCurrent = sessionNumber === data.currentSession}
				{@const isLocked = sessionNumber > 1 && !isCompleted && !isCurrent && (() => {
					// Check if previous sessions are completed
					for (let i = 0; i < sessionNumber - 1; i++) {
						const prevLessonId = data.course.lessons[i]?.id;
						const prevProgress = data.lessonProgress.find(p => p.lessonId === prevLessonId);
						if (!prevProgress || !prevProgress.completed) {
							return true;
						}
					}
					return false;
				})()}
				<button
					onclick={() => goToSession(sessionNumber)}
					disabled={isLocked}
					class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
						{isCurrent 
							? 'bg-green-600 text-white' 
							: isCompleted 
								? 'bg-green-100 text-green-600 hover:bg-green-200' 
								: isLocked
									? 'bg-gray-50 text-gray-300 cursor-not-allowed'
									: 'bg-gray-100 text-gray-400 hover:bg-gray-200'}"
				>
					{sessionNumber}
				</button>
			{/each}
		</div>
	</div>

	<!-- Main Learning Content -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Lesson Content -->
		<div class="lg:col-span-2">
			<div class="bg-white rounded-xl border border-gray-200 p-8 min-h-[400px]">
				{#if data.currentLesson}
					<!-- Lesson Header -->
					<div class="mb-6">
						<div class="text-4xl mb-4 text-center">
							{getLanguageFlag(data.course.language)}
						</div>
						<h2 class="text-3xl font-bold text-gray-900 mb-2">{data.currentLesson.title}</h2>
						{#if data.currentLesson.description}
							<p class="text-lg text-gray-600 mb-4">{data.currentLesson.description}</p>
						{/if}
					</div>

					<!-- Lesson Content -->
					{#if data.currentLesson.contentHtml}
						{@const lessonData = JSON.parse(data.currentLesson.contentHtml)}
						
						<!-- Lesson Introduction -->
						<div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
							<h3 class="text-lg font-semibold text-blue-900 mb-2">Welcome to this lesson!</h3>
							<p class="text-blue-800">{lessonData.introduction}</p>
						</div>

						<!-- Vocabulary Section -->
						{#if lessonData.vocabulary && lessonData.vocabulary.length > 0}
							<div class="space-y-4">
								<h3 class="text-xl font-semibold text-gray-900 mb-4">📚 Key Vocabulary</h3>
								
								<div class="grid gap-4 md:grid-cols-2">
									{#each lessonData.vocabulary as word, wordIndex}
										<button 
											class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer text-left w-full"
											onclick={() => reviewWord()}
										>
											<div class="flex items-start justify-between mb-2">
												<h4 class="text-lg font-bold text-gray-900">{word.igbo}</h4>
												<span class="text-2xl">{getLanguageFlag(data.course.language)}</span>
											</div>
											
											<p class="text-gray-600 italic mb-2">/{word.pronunciation}/</p>
											<p class="text-green-700 font-medium mb-2">{word.english}</p>
											
											{#if word.examples && word.examples.length > 0}
												<div class="mt-3 pt-3 border-t border-gray-100">
													<p class="text-sm font-medium text-gray-700 mb-1">Examples:</p>
													{#each word.examples as example}
														<div class="text-sm text-gray-600">
															<span class="font-medium">{example.igbo}</span> - 
															<span>{example.english}</span>
														</div>
													{/each}
												</div>
											{/if}
											
											{#if word.culturalNote}
												<div class="mt-3 pt-3 border-t border-gray-100">
													<p class="text-xs text-purple-600 bg-purple-50 p-2 rounded">
														💡 <strong>Cultural Note:</strong> {word.culturalNote}
													</p>
												</div>
											{/if}
										</button>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Quiz Section -->
						{#if hasQuizzes}
							<div class="quiz-section mt-8 pt-8 border-t border-gray-200">
								<h3 class="text-xl font-semibold text-gray-900 mb-4">📝 Lesson Quiz</h3>
								
								<div class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
									<div class="text-4xl mb-4">🎯</div>
									<h4 class="text-lg font-medium text-blue-900 mb-2">Ready to Test Your Knowledge?</h4>
									<p class="text-blue-700 mb-4">
										This lesson has {currentQuizzes.length} quiz question{currentQuizzes.length > 1 ? 's' : ''} waiting for you.
									</p>
									<p class="text-sm text-blue-600 mb-4">
										Click the "Take Test" button in the sidebar to open the interactive quiz modal with timer.
									</p>
									<div class="flex items-center justify-center text-sm text-blue-600">
										<Clock class="w-4 h-4 mr-1" />
										<span>{currentQuizzes.length < 4 ? '5 minutes' : '10 minutes'} time limit</span>
									</div>
								</div>
							</div>
						{/if}
					{:else}
						<div class="text-center text-gray-500">
							<p>Lesson content is being prepared...</p>
						</div>
					{/if}
				{:else}
					<div class="text-center text-gray-500">
						<p>No lesson content available</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Session Progress -->
			<div class="bg-white rounded-xl border border-gray-200 p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-4">Session Progress</h3>
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-600">Words Reviewed</span>
						<span class="text-sm font-medium text-gray-900">{wordsReviewed} / {vocabularyWords.length}</span>
					</div>
					<div class="w-full bg-gray-200 rounded-full h-2">
						<div 
							class="bg-blue-600 h-2 rounded-full transition-all duration-300"
							style="width: {vocabularyWords.length > 0 ? (wordsReviewed / vocabularyWords.length) * 100 : 0}%"
						></div>
					</div>
				</div>
			</div>

			<!-- Session Completion / Test Section -->
			<div class="bg-white rounded-xl border border-gray-200 p-6">
				{#if hasQuizzes && canTakeQuiz}
					<!-- Take Test Button - when quiz can be taken -->
					<h3 class="text-lg font-semibold text-gray-900 mb-4">Ready for the Test?</h3>
					<p class="text-sm text-gray-600 mb-4">
						Test your knowledge of the vocabulary and concepts from this lesson. You need 80% to pass.
					</p>
					
					{#if totalAttempts > 0}
						<div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
							<div class="text-sm space-y-1">
								<div class="flex justify-between items-center">
									<span class="text-blue-700">Previous attempts:</span>
									<span class="font-medium text-blue-900">{totalAttempts}</span>
								</div>
								<div class="flex justify-between items-center">
									<span class="text-blue-700">Best score:</span>
									<span class="font-medium text-blue-900">{bestScore}%</span>
								</div>
							</div>
						</div>
					{/if}
					
					<button
						onclick={startQuizModal}
						class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
					>
						<Play class="h-5 w-5 mr-2" />
						{totalAttempts > 0 ? 'Retake Test' : 'Take Test'}
					</button>
				{:else if hasQuizzes && !canTakeQuiz}
					<!-- Quiz already passed -->
					<h3 class="text-lg font-semibold text-gray-900 mb-4">Quiz Completed ✅</h3>
					<p class="text-sm text-gray-600 mb-4">
						Congratulations! You've passed this lesson quiz with {bestScore}%.
					</p>
					
					<div class="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
						<div class="text-sm space-y-1">
							<div class="flex justify-between items-center">
								<span class="text-green-700">Status:</span>
								<span class="font-medium text-green-900">Passed (≥80%)</span>
							</div>
							<div class="flex justify-between items-center">
								<span class="text-green-700">Final score:</span>
								<span class="font-medium text-green-900">{bestScore}%</span>
							</div>
							<div class="flex justify-between items-center">
								<span class="text-green-700">Total attempts:</span>
								<span class="font-medium text-green-900">{totalAttempts}</span>
							</div>
						</div>
					</div>
					
					<button
						disabled
						class="w-full bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center cursor-not-allowed opacity-60"
					>
						<X class="h-5 w-5 mr-2" />
						No More Attempts
					</button>
				{:else}
					<!-- Complete Session Button - when no quizzes or all quizzes completed -->
					{#if data.currentLessonProgress?.completed}
						<h3 class="text-lg font-semibold text-gray-900 mb-4">Session Completed</h3>
						<p class="text-sm text-gray-600 mb-4">
							✅ You have successfully completed this session!
						</p>
						
						<button
							disabled
							class="w-full bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center cursor-not-allowed opacity-60"
						>
							<CheckCircle class="h-5 w-5 mr-2" />
							Session Completed
						</button>
					{:else}
						<h3 class="text-lg font-semibold text-gray-900 mb-4">Complete Session</h3>
						<p class="text-sm text-gray-600 mb-4">
							{#if hasQuizzes}
								Excellent! You have completed all quizzes. Mark this session as complete.
							{:else}
								Review all words and their definitions to complete this session.
							{/if}
						</p>
						
						<button
							onclick={markSessionComplete}
							class="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
						>
							<CheckCircle class="h-5 w-5 mr-2" />
							Complete Session
						</button>
					{/if}
				{/if}
			</div>			<!-- Quick Stats -->
			<div class="bg-white rounded-xl border border-gray-200 p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-600">Time Spent</span>
						<span class="text-sm font-medium text-gray-900">{data.currentLessonProgress ? Math.floor(data.currentLessonProgress.timeSpent / 60) : 0}m</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-600">Session Status</span>
						<span class="text-sm font-medium {data.currentLessonProgress?.completed ? 'text-green-600' : 'text-orange-600'}">
							{data.currentLessonProgress?.completed ? 'Completed' : 'In Progress'}
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Quiz Modal -->
{#if showQuizModal}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
			<!-- Modal Header -->
			<div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
				<div class="flex items-center justify-between">
					<div>
						<h2 class="text-2xl font-bold">📝 Lesson Quiz</h2>
						<p class="text-blue-100 mt-1">Test your knowledge</p>
					</div>
					<div class="text-right">
						<div class="text-2xl font-bold text-yellow-300">
							⏰ {formatTime(timeRemaining)}
						</div>
						<p class="text-xs text-blue-100">Time remaining</p>
					</div>
				</div>
				
				<!-- Progress Bar -->
				<div class="mt-4">
					<div class="flex justify-between text-sm text-blue-100 mb-2">
						<span>Question {currentQuestionIndex + 1} of {currentQuizzes.length}</span>
						<span>{Math.round(((currentQuestionIndex + 1) / currentQuizzes.length) * 100)}% Complete</span>
					</div>
					<div class="w-full bg-blue-800 rounded-full h-2">
						<div 
							class="bg-yellow-400 h-2 rounded-full transition-all duration-300"
							style="width: {((currentQuestionIndex + 1) / currentQuizzes.length) * 100}%"
						></div>
					</div>
				</div>
			</div>

			<!-- Modal Body -->
			<div class="p-6 overflow-y-auto max-h-96">
				{#if !quizCompleted}
					{@const currentQuestion = currentQuizzes[currentQuestionIndex]}
					{@const questionOptions = parseQuizOptions(currentQuestion.options)}
					
					<div class="mb-6">
						<h3 class="text-xl font-semibold text-gray-800 mb-4">
							{currentQuestion.question}
						</h3>
						
						<div class="space-y-3">
							{#each questionOptions as option, index}
								<label class="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-blue-50 {quizAnswers[currentQuestionIndex] === option ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}">
									<input 
										type="radio" 
										name="quiz-answer-{currentQuestionIndex}"
										value={option}
										checked={quizAnswers[currentQuestionIndex] === option}
										onchange={() => selectAnswer(option)}
										class="mr-3 text-blue-600"
									/>
									<span class="text-gray-700 font-medium">{option}</span>
								</label>
							{/each}
						</div>
					</div>
				{:else}
					<!-- Quiz Results -->
					<div class="text-center py-8">
						<div class="mb-6">
							<div class="w-20 h-20 {quizPassed ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-4">
								{#if quizPassed}
									<CheckCircle class="w-12 h-12 text-green-600" />
								{:else}
									<X class="w-12 h-12 text-red-600" />
								{/if}
							</div>
							
							<h3 class="text-2xl font-bold text-gray-800 mb-2">
								{quizPassed ? 'Quiz Passed!' : 'Quiz Failed'}
							</h3>
							
							<div class="mb-4">
								<div class="text-4xl font-bold {quizPassed ? 'text-green-600' : 'text-red-600'} mb-2">
									{quizScore}%
								</div>
								<p class="text-gray-600">
									{quizPassed ? 'Congratulations! You passed the quiz.' : 'You need 80% or higher to pass.'}
								</p>
							</div>
							
							<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
								<div class="grid grid-cols-2 gap-4 text-sm">
									<div>
										<span class="text-gray-600">Score:</span>
										<span class="font-medium text-gray-800">{quizScore}%</span>
									</div>
									<div>
										<span class="text-gray-600">Status:</span>
										<span class="font-medium {quizPassed ? 'text-green-600' : 'text-red-600'}">
											{quizPassed ? 'Passed (≥80%)' : 'Failed (<80%)'}
										</span>
									</div>
									<div>
										<span class="text-gray-600">Total attempts:</span>
										<span class="font-medium text-gray-800">{totalAttempts}</span>
									</div>
									<div>
										<span class="text-gray-600">Best score:</span>
										<span class="font-medium text-blue-600">{Math.max(bestScore, quizScore)}%</span>
									</div>
								</div>
							</div>
							
							{#if !quizPassed}
								<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
									<p class="text-blue-800 font-medium">
										💡 You can try again as many times as needed to reach 80%!
									</p>
								</div>
							{:else}
								<div class="bg-green-50 border border-green-200 rounded-lg p-4">
									{#if data.currentSession < data.totalSessions}
										<p class="text-green-800 font-medium">
											🎉 Lesson completed! Moving to the next lesson automatically...
										</p>
									{:else}
										<p class="text-green-800 font-medium">
											🏆 Congratulations! You've completed the entire course!
										</p>
									{/if}
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</div>

			<!-- Modal Footer -->
			{#if !quizCompleted}
				<div class="bg-gray-50 px-6 py-4 flex items-center justify-between">
					<button
						onclick={previousQuestion}
						disabled={currentQuestionIndex === 0}
						class="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						<ChevronLeft class="w-4 h-4 mr-1" />
						Previous
					</button>

					<div class="flex items-center space-x-2">
						{#each currentQuizzes as _, index}
							<div class="w-3 h-3 rounded-full {index === currentQuestionIndex ? 'bg-blue-600' : index < currentQuestionIndex ? 'bg-green-500' : 'bg-gray-300'}"></div>
						{/each}
					</div>

					{#if currentQuestionIndex === currentQuizzes.length - 1}
						<button
							onclick={submitQuizModal}
							disabled={!quizAnswers[currentQuestionIndex]}
							class="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
						>
							Submit Quiz
							<CheckCircle class="w-4 h-4 ml-2" />
						</button>
					{:else}
						<button
							onclick={nextQuestion}
							disabled={!quizAnswers[currentQuestionIndex]}
							class="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
						>
							Next
							<ChevronRight class="w-4 h-4 ml-1" />
						</button>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- Course Completion Modal -->
{#if showCourseCompletionModal}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative">
			<!-- Celebration Animation -->
			<div class="mb-6">
				<div class="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
					<span class="text-4xl">🏆</span>
				</div>
				<div class="text-6xl mb-4">🎉</div>
			</div>
			
			<!-- Congratulations Header -->
			<h2 class="text-3xl font-bold text-gray-800 mb-2">
				Congratulations!
			</h2>
			
			<p class="text-xl text-gray-600 mb-6">
				You have successfully completed
			</p>
			
			<!-- Course Title -->
			<div class="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
				<h3 class="text-2xl font-bold text-green-800 mb-2">
					{data.course.title}
				</h3>
				<p class="text-green-600">
					{data.course.language} • {data.course.level} Level
				</p>
			</div>
			
			<!-- Achievement Stats -->
			<div class="bg-gray-50 rounded-xl p-4 mb-6">
				<div class="grid grid-cols-2 gap-4 text-sm">
					<div>
						<div class="text-2xl font-bold text-blue-600">{data.totalSessions}</div>
						<div class="text-gray-600">Sessions Completed</div>
					</div>
					<div>
						<div class="text-2xl font-bold text-purple-600">100%</div>
						<div class="text-gray-600">Course Progress</div>
					</div>
				</div>
			</div>
			
			<!-- Motivational Message -->
			<div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
				<p class="text-blue-800 font-medium">
					🌟 Amazing work! You've mastered the fundamentals of business communication in {data.course.language}.
				</p>
			</div>
			
			<!-- Action Buttons -->
			<div class="flex flex-col space-y-3">
				<button
					onclick={closeCourseCompletionModal}
					class="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
				>
					Continue Learning
				</button>
				
				<button
					onclick={() => {
						// Optional: Share achievement or download certificate
						closeCourseCompletionModal();
					}}
					class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-6 rounded-xl font-medium transition-colors"
				>
					View My Courses
				</button>
			</div>
			
			<!-- Confetti Elements -->
			<div class="absolute top-4 left-4 text-yellow-400 text-xl animate-pulse">✨</div>
			<div class="absolute top-6 right-6 text-yellow-400 text-lg animate-bounce">⭐</div>
			<div class="absolute bottom-6 left-6 text-pink-400 text-lg animate-pulse">🎊</div>
			<div class="absolute bottom-4 right-4 text-green-400 text-xl animate-bounce">🎉</div>
		</div>
	</div>
{/if}

{/if}

<!-- Alert Modal -->
<AlertModal
	bind:isOpen={showAlertModal}
	title={alertTitle}
	message={alertMessage}
	type={alertType}
	onClose={() => {}}
/>
