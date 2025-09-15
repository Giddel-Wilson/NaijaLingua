<script lang="ts">
	import { page } from '$app/stores';
	import { ArrowLeft, BookOpen, Volume2, Eye, Clock, Users } from 'lucide-svelte';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	
	// Use $derived for computed values in runes mode
	let lesson = $derived(data.lesson);
	let vocabulary = $derived(data.vocabulary);
	let culturalContent = $derived(data.culturalContent);

	// Parse lesson content - use $derived.by for complex computations
	let parsedContent = $derived.by(() => {
		if (!lesson.contentHtml) return null;
		
		try {
			return JSON.parse(lesson.contentHtml);
		} catch (e) {
			console.log('Content is not JSON, treating as HTML');
			return null;
		}
	});

	let introduction = $derived(parsedContent?.introduction || '');
	let contentVocabulary = $derived(parsedContent?.vocabulary || []);
	let contentWords = $derived(parsedContent?.words || []);
	let contentPhrases = $derived(parsedContent?.phrases || []);
	let examples = $derived(parsedContent?.examples || parsedContent?.practicalPhrases || []);
	let contentCulturalNotes = $derived(parsedContent?.culturalNote || parsedContent?.culturalNotes || '');
	let contentGrammar = $derived(parsedContent?.grammar || '');
	let contentSummary = $derived(parsedContent?.summary || '');
	let contentPronunciation = $derived(parsedContent?.pronunciation || '');
	let contentExercises = $derived(parsedContent?.exercises || []);
</script>

<svelte:head>
	<title>Preview: {lesson.title} | NaijaLingua Admin</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<div class="bg-white shadow-sm border-b">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16">
				<div class="flex items-center space-x-4">
					<a 
						href="/admin/courses/{lesson.courseId}" 
						class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
					>
						<ArrowLeft class="w-5 h-5" />
						Back to Course
					</a>
					<div class="h-6 w-px bg-gray-300"></div>
					<div class="flex items-center gap-2">
						<Eye class="w-5 h-5 text-purple-600" />
						<span class="font-medium text-gray-900">Lesson Preview</span>
					</div>
				</div>
				
				<div class="flex items-center gap-4">
					<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
						{lesson.course.language}
					</span>
					<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
						{lesson.course.level}
					</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Lesson Info -->
		<div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
			<div class="flex items-start justify-between">
				<div class="flex-1">
					<h1 class="text-2xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
					<p class="text-gray-600 mb-4">{lesson.description || 'No description available'}</p>
					
					<div class="flex items-center gap-6 text-sm text-gray-500">
						<div class="flex items-center gap-1">
							<Clock class="w-4 h-4" />
							<span>{lesson.duration || 15} minutes</span>
						</div>
						<div class="flex items-center gap-1">
							<BookOpen class="w-4 h-4" />
							<span>Lesson {lesson.order}</span>
						</div>
						<div class="flex items-center gap-1">
							<Users class="w-4 h-4" />
							<span>{lesson.course.title}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Lesson Content -->
		<div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">Lesson Content</h2>
			
			<!-- Debug Information -->
			<div class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
				<h3 class="font-semibold mb-2">Debug Info:</h3>
				<p><strong>Has contentHtml:</strong> {!!lesson.contentHtml}</p>
				<p><strong>Content length:</strong> {lesson.contentHtml?.length || 0}</p>
				<p><strong>Parsed content exists:</strong> {!!parsedContent}</p>
				<p><strong>Introduction:</strong> "{introduction}"</p>
				<p><strong>Vocabulary count:</strong> {contentVocabulary.length}</p>
				<p><strong>Words count:</strong> {contentWords.length}</p>
				<p><strong>Phrases count:</strong> {contentPhrases.length}</p>
				<p><strong>Examples count:</strong> {examples.length}</p>
				<p><strong>Cultural notes:</strong> "{contentCulturalNotes}"</p>
				<p><strong>Grammar:</strong> "{contentGrammar}"</p>
				<p><strong>Summary:</strong> "{contentSummary}"</p>
				{#if lesson.contentHtml}
					<details class="mt-2">
						<summary class="cursor-pointer text-sm">Raw contentHtml (first 200 chars)</summary>
						<pre class="text-xs mt-2 bg-white p-2 rounded overflow-x-auto">{lesson.contentHtml.substring(0, 200)}...</pre>
					</details>
				{/if}
				{#if parsedContent}
					<details class="mt-2">
						<summary class="cursor-pointer text-sm">Available keys in parsed content</summary>
						<pre class="text-xs mt-2 bg-white p-2 rounded">{JSON.stringify(Object.keys(parsedContent), null, 2)}</pre>
					</details>
				{/if}
			</div>
			
			{#if parsedContent}
				<!-- Introduction -->
				{#if introduction}
					<div class="mb-6">
						<h3 class="text-lg font-medium text-gray-900 mb-3">Introduction</h3>
						<div class="prose max-w-none">
							<p class="text-gray-700">{introduction}</p>
						</div>
					</div>
				{/if}

				<!-- Vocabulary from Content -->
				{#if contentVocabulary.length > 0}
					<div class="mb-6">
						<h3 class="text-lg font-medium text-gray-900 mb-3">Key Vocabulary</h3>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							{#each contentVocabulary as vocab}
								<div class="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
									<div class="flex items-center justify-between mb-2">
										<span class="font-semibold text-gray-900">{vocab.igbo || vocab.word || 'N/A'}</span>
										{#if vocab.pronunciation}
											<span class="text-sm text-gray-500">/{vocab.pronunciation}/</span>
										{/if}
									</div>
									<p class="text-gray-700 text-sm">{vocab.english || vocab.translation || 'Translation not available'}</p>
									{#if vocab.examples && vocab.examples.length > 0}
										<div class="mt-2">
											<p class="text-xs text-gray-600 font-medium">Examples:</p>
											{#each vocab.examples as example}
												<p class="text-xs text-gray-600">• {example.igbo || example.phrase || ''} - {example.english || example.translation || ''}</p>
											{/each}
										</div>
									{/if}
									{#if vocab.variations && vocab.variations.length > 0}
										<div class="mt-2">
											<p class="text-xs text-gray-600 font-medium">Variations:</p>
											{#each vocab.variations as variation}
												<p class="text-xs text-gray-600">• {variation.form || variation} - {variation.usage || ''}</p>
											{/each}
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Examples/Practical Phrases -->
				{#if examples.length > 0}
					<div class="mb-6">
						<h3 class="text-lg font-medium text-gray-900 mb-3">Practical Examples</h3>
						<div class="space-y-3">
							{#each examples as example}
								<div class="p-3 bg-green-50 rounded-lg border border-green-200">
									<div class="flex justify-between items-start">
										<div class="flex-1">
											<p class="font-medium text-gray-900">{example.igbo || example.phrase || 'N/A'}</p>
											<p class="text-gray-700 text-sm">{example.english || example.translation || 'Translation not available'}</p>
										</div>
										{#if example.pronunciation}
											<span class="text-xs text-gray-500 ml-2">/{example.pronunciation}/</span>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Cultural Notes from Content -->
				{#if contentCulturalNotes}
					<div class="mb-6">
						<h3 class="text-lg font-medium text-gray-900 mb-3">Cultural Context</h3>
						<div class="p-4 bg-purple-50 rounded-lg border border-purple-200">
							<p class="text-gray-700">{contentCulturalNotes}</p>
						</div>
					</div>
				{/if}

				<!-- Words Section -->
				{#if contentWords.length > 0}
					<div class="mb-6">
						<h3 class="text-lg font-medium text-gray-900 mb-3">Additional Words</h3>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							{#each contentWords as word}
								<div class="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
									<div class="flex items-center justify-between mb-2">
										<span class="font-semibold text-gray-900">{word.igbo || word.word || 'N/A'}</span>
										{#if word.pronunciation}
											<span class="text-sm text-gray-500">/{word.pronunciation}/</span>
										{/if}
									</div>
									<p class="text-gray-700 text-sm">{word.english || word.translation || 'Translation not available'}</p>
									{#if word.partOfSpeech}
										<p class="text-xs text-orange-600 mt-1">{word.partOfSpeech}</p>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Phrases Section -->
				{#if contentPhrases.length > 0}
					<div class="mb-6">
						<h3 class="text-lg font-medium text-gray-900 mb-3">Key Phrases</h3>
						<div class="space-y-3">
							{#each contentPhrases as phrase}
								<div class="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
									<div class="flex justify-between items-start">
										<div class="flex-1">
											<p class="font-medium text-gray-900">{phrase.igbo || phrase.phrase || 'N/A'}</p>
											<p class="text-gray-700 text-sm">{phrase.english || phrase.translation || 'Translation not available'}</p>
										</div>
										{#if phrase.pronunciation}
											<span class="text-xs text-gray-500 ml-2">/{phrase.pronunciation}/</span>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Grammar Section -->
				{#if contentGrammar}
					<div class="mb-6">
						<h3 class="text-lg font-medium text-gray-900 mb-3">Grammar Notes</h3>
						<div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
							<div class="prose max-w-none">
								{#if typeof contentGrammar === 'string'}
									<p class="text-gray-700">{contentGrammar}</p>
								{:else}
									{#each Object.entries(contentGrammar) as [key, value]}
										<div class="mb-3">
											<h4 class="font-medium text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
											<p class="text-gray-700 text-sm">{value}</p>
										</div>
									{/each}
								{/if}
							</div>
						</div>
					</div>
				{/if}

				<!-- Summary Section -->
				{#if contentSummary}
					<div class="mb-6">
						<h3 class="text-lg font-medium text-gray-900 mb-3">Lesson Summary</h3>
						<div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
							<p class="text-gray-700">{contentSummary}</p>
						</div>
					</div>
				{/if}

				<!-- Raw JSON for Debug (Admin View) -->
				<details class="mt-6">
					<summary class="cursor-pointer text-sm text-gray-500 hover:text-gray-700">View Raw Content (Developer)</summary>
					<div class="mt-2 p-4 bg-gray-100 rounded-lg border">
						<pre class="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(parsedContent, null, 2)}</pre>
					</div>
				</details>

			{:else if lesson.contentHtml}
				<!-- Fallback for HTML content -->
				<div class="prose max-w-none">
					{@html lesson.contentHtml}
				</div>
			{:else}
				<p class="text-gray-500 italic">No content available for this lesson.</p>
			{/if}
		</div>

		<!-- Additional Vocabulary (from database) -->
		{#if vocabulary && vocabulary.length > 0 && contentVocabulary.length === 0}
			<div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
				<h2 class="text-xl font-semibold text-gray-900 mb-4">Additional Vocabulary</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					{#each vocabulary as vocab}
						<div class="p-4 bg-gray-50 rounded-lg">
							<div class="flex items-center justify-between mb-2">
								<span class="font-medium text-gray-900">{vocab.word}</span>
								{#if vocab.pronunciation}
									<button class="text-purple-600 hover:text-purple-700">
										<Volume2 class="w-4 h-4" />
									</button>
								{/if}
							</div>
							<p class="text-gray-600 text-sm">{vocab.translation}</p>
							{#if vocab.pronunciation}
								<p class="text-gray-500 text-xs mt-1">/{vocab.pronunciation}/</p>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Quiz Section -->
		{#if lesson.quizzes && lesson.quizzes.length > 0}
			<div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
				<h2 class="text-xl font-semibold text-gray-900 mb-4">Quiz Questions</h2>
				<div class="space-y-4">
					{#each lesson.quizzes as quiz, idx}
						<div class="p-4 bg-gray-50 rounded-lg">
							<h3 class="font-medium text-gray-900 mb-3">Question {idx + 1}: {quiz.question}</h3>
							
							{#if quiz.type === 'MCQ'}
								<div class="space-y-2">
									{#each quiz.options as option, optIdx}
										<label class="flex items-center space-x-2 cursor-pointer">
											<input 
												type="radio" 
												name="quiz-{quiz.id}" 
												value={option}
												class="text-purple-600 focus:ring-purple-500"
												disabled
											/>
											<span class="text-sm {option === quiz.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-700'}">{option}</span>
										</label>
									{/each}
								</div>
							{/if}
							
							{#if quiz.explanation}
								<div class="mt-3 p-3 bg-blue-50 rounded-md">
									<p class="text-sm text-blue-800"><strong>Explanation:</strong> {quiz.explanation}</p>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Additional Cultural Content (from database) -->
		{#if culturalContent && culturalContent.length > 0 && !contentCulturalNotes}
			<div class="bg-white rounded-lg shadow-sm border p-6">
				<h2 class="text-xl font-semibold text-gray-900 mb-4">Additional Cultural Context</h2>
				<div class="space-y-4">
					{#each culturalContent as cultural}
						<div class="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
							<h3 class="font-medium text-gray-900 mb-2">{cultural.title}</h3>
							<p class="text-gray-700 text-sm">{cultural.content}</p>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.prose {
		color: #374151;
		line-height: 1.7;
	}
	
	.prose p {
		margin-bottom: 1rem;
	}
	
	.prose h3 {
		font-size: 1.125rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		margin-top: 1.5rem;
	}
	
	.prose ul {
		list-style-type: disc;
		padding-left: 1.5rem;
		margin-bottom: 1rem;
	}
	
	.prose li {
		margin-bottom: 0.25rem;
	}
</style>
