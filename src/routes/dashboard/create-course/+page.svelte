<script lang="ts">
	import { enhance } from '$app/forms';
	import { 
		BookOpen, 
		Sparkles, 
		Globe, 
		Brain, 
		Users, 
		Mic,
		Database,
		ArrowRight,
		Check,
		Star,
		Zap
	} from 'lucide-svelte';
	import LessonPreview from '$lib/components/LessonPreview.svelte';
	import type { PageData, ActionData } from './$types';
	
	let { data, form }: { data: PageData; form: ActionData } = $props();
	
	let useAIGeneration = $state(true);
	let selectedLanguage = $state('igbo');
	let selectedLevel = $state('BEGINNER');
	let selectedTopic = $state('greetings');
	let isGenerating = $state(false);
	let previewContent = $state(null);
	let showPreview = $state(false);
	
	const levels = [
		{ value: 'BEGINNER', label: 'Beginner', description: 'Start from basics' },
		{ value: 'INTERMEDIATE', label: 'Intermediate', description: 'Build on existing knowledge' },
		{ value: 'ADVANCED', label: 'Advanced', description: 'Master complex concepts' }
	];
	
	const categories = [
		'Language Learning', 'Cultural Studies', 'Business Communication', 
		'Travel & Tourism', 'Literature', 'History', 'Music & Arts'
	];
	
	async function previewAIContent() {
		if (!selectedLanguage || !selectedLevel || !selectedTopic) return;
		
		isGenerating = true;
		showPreview = false;
		
		try {
			const response = await fetch('/api/content-generation', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					language: selectedLanguage,
					level: selectedLevel,
					topic: selectedTopic
				})
			});
			
			const result = await response.json();
			if (result.success) {
				previewContent = result;
				showPreview = true;
			}
		} catch (error) {
			console.error('Preview error:', error);
		} finally {
			isGenerating = false;
		}
	}
	
	function formatLanguageName(code: string) {
		return data.supportedLanguages.find(lang => lang.code === code)?.name || code;
	}

	// Prevent accidental form submission
	function validateForm(event: SubmitEvent) {
		const target = event.target as HTMLFormElement;
		const formData = new FormData(target);
		const title = formData.get('title') as string;
		
		if (!title || title.trim().length < 3) {
			event.preventDefault();
			alert('Please enter a course title with at least 3 characters.');
			return false;
		}
		
		// Additional validation for AI content
		if (useAIGeneration) {
			if (!selectedLanguage || !selectedLevel || !selectedTopic) {
				event.preventDefault();
				alert('Please select language, level, and topic for AI content generation.');
				return false;
			}
		}
		
		return true;
	}
</script>

<svelte:head>
	<title>Create Course - NaijaLingua</title>
</svelte:head>

<div class="max-w-4xl mx-auto p-8">
	<!-- Header -->
	<div class="mb-8">
		<div class="flex items-center gap-3 mb-4">
			<div class="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
				<BookOpen class="w-6 h-6 text-white" />
			</div>
			<div>
				<h1 class="text-3xl font-bold text-gray-900">Create New Course</h1>
				<p class="text-gray-600">Build engaging African language courses with AI-powered content</p>
			</div>
		</div>
		
		<!-- AI Features Banner -->
		<div class="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-6 mb-8">
			<div class="flex items-start gap-4">
				<div class="p-2 bg-emerald-100 rounded-lg">
					<Sparkles class="w-6 h-6 text-emerald-600" />
				</div>
				<div class="flex-1">
					<h3 class="text-lg font-semibold text-gray-900 mb-2">
						🚀 Powered by African Language APIs
					</h3>
					<div class="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
						<div class="flex items-center gap-2">
							<Database class="w-4 h-4 text-blue-500" />
							<span><strong>MAVEN API:</strong> Comprehensive African language datasets</span>
						</div>
						<div class="flex items-center gap-2">
							<Globe class="w-4 h-4 text-green-500" />
							<span><strong>Igbo API:</strong> Authentic Igbo vocabulary and examples</span>
						</div>
						<div class="flex items-center gap-2">
							<Mic class="w-4 h-4 text-purple-500" />
							<span><strong>CommonVoice:</strong> Real audio from native speakers</span>
						</div>
						<div class="flex items-center gap-2">
							<Brain class="w-4 h-4 text-orange-500" />
							<span><strong>Lanfrica:</strong> Curated African language corpus</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	
	{#if form?.success}
		<div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
			<div class="flex items-center gap-2 text-green-800">
				<Check class="w-5 h-5" />
				<span class="font-medium">{form.message}</span>
			</div>
			{#if form.courseId}
				<a href="/dashboard/courses/{form.courseId}" 
				   class="inline-flex items-center gap-2 mt-3 text-green-700 hover:text-green-800 font-medium">
					View Course <ArrowRight class="w-4 h-4" />
				</a>
			{/if}
		</div>
	{/if}
	
	{#if form?.error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
			{form.error}
		</div>
	{/if}
	
	<form method="POST" action="?/createCourse" use:enhance class="space-y-8" onsubmit={validateForm}>
		<!-- Basic Course Information -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
			<h2 class="text-xl font-semibold text-gray-900 mb-6">Course Information</h2>
			
			<div class="grid md:grid-cols-2 gap-6">
				<div>
					<label for="title" class="block text-sm font-medium text-gray-700 mb-2">
						Course Title *
					</label>
					<input 
						type="text" 
						id="title" 
						name="title" 
						required
						placeholder="e.g., Master Igbo Greetings and Conversation"
						class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						onkeydown={(event) => { if(event.key === 'Enter') event.preventDefault(); }}
					/>
				</div>
				
				<div>
					<label for="category" class="block text-sm font-medium text-gray-700 mb-2">
						Category
					</label>
					<select 
						id="category" 
						name="category"
						class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						{#each categories as category}
							<option value={category}>{category}</option>
						{/each}
					</select>
				</div>
			</div>
			
			<div class="mt-6">
				<label for="description" class="block text-sm font-medium text-gray-700 mb-2">
					Description
				</label>
				<textarea 
					id="description" 
					name="description" 
					rows="4"
					placeholder="Describe what students will learn in this course..."
					class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					onkeydown={(event) => { if(event.key === 'Enter' && !event.shiftKey) event.preventDefault(); }}
				></textarea>
			</div>
			
			<div class="grid md:grid-cols-2 gap-6 mt-6">
				<div>
					<label for="price" class="block text-sm font-medium text-gray-700 mb-2">
						Price (USD)
					</label>
					<input 
						type="number" 
						id="price" 
						name="price" 
						min="0" 
						step="0.01"
						placeholder="0.00"
						class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						onkeydown={(event) => { if(event.key === 'Enter') event.preventDefault(); }}
					/>
				</div>
			</div>
		</div>
		
		<!-- AI Content Generation -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
			<div class="flex items-center gap-3 mb-6">
				<Zap class="w-6 h-6 text-yellow-500" />
				<h2 class="text-xl font-semibold text-gray-900">AI Content Generation</h2>
			</div>
			
			<div class="mb-6">
				<label class="flex items-center gap-3">
					<input 
						type="checkbox" 
						name="useAIGeneration" 
						value="true"
						bind:checked={useAIGeneration}
						class="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm font-medium text-gray-700">
						Generate course content automatically using African language APIs
					</span>
				</label>
				<p class="text-sm text-gray-500 mt-2 ml-8">
					Create lessons, vocabulary, phrases, and exercises from authentic African language datasets
				</p>
			</div>
			
			{#if useAIGeneration}
				<div class="space-y-6 p-4 bg-gray-50 rounded-lg">
					<div class="grid md:grid-cols-3 gap-4">
						<div>
							<label for="language" class="block text-sm font-medium text-gray-700 mb-2">
								Language *
							</label>
							<select 
								id="language" 
								name="language" 
								bind:value={selectedLanguage}
								required
								class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							>
								{#each data.supportedLanguages as lang}
									<option value={lang.code}>{lang.flag} {lang.name}</option>
								{/each}
							</select>
						</div>
						
						<div>
							<label for="level" class="block text-sm font-medium text-gray-700 mb-2">
								Level *
							</label>
							<select 
								id="level" 
								name="level" 
								bind:value={selectedLevel}
								required
								class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							>
								{#each levels as level}
									<option value={level.value}>
										{level.label} - {level.description}
									</option>
								{/each}
							</select>
						</div>
						
						<div>
							<label for="contentTopic" class="block text-sm font-medium text-gray-700 mb-2">
								Content Topic *
							</label>
							<select 
								id="contentTopic" 
								name="contentTopic" 
								bind:value={selectedTopic}
								required
								class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							>
								{#each data.contentTopics as topic}
									<option value={topic}>{topic.charAt(0).toUpperCase() + topic.slice(1).replace('_', ' ')}</option>
								{/each}
							</select>
						</div>
					</div>
					
					<div class="flex items-center gap-4">
						<button 
							type="button"
							onclick={previewAIContent}
							disabled={isGenerating}
							class="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
						>
							{#if isGenerating}
								<div class="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
								Generating...
							{:else}
								<Brain class="w-4 h-4" />
								Preview AI Content
							{/if}
						</button>
						
						{#if showPreview && previewContent}
							<div class="text-sm text-green-600 flex items-center gap-2">
								<Check class="w-4 h-4" />
								{previewContent.lessons?.length || 0} lessons will be generated
							</div>
						{/if}
					</div>
				</div>
			{:else}
				<input type="hidden" name="language" value="IGBO" />
				<input type="hidden" name="level" value="BEGINNER" />
			{/if}
		</div>
		
		<!-- Enhanced Preview Generated Content -->
		{#if showPreview && previewContent?.lessons}
			<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
				<div class="flex items-center justify-between mb-6">
					<div>
						<h3 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
							🌍 Generated African Language Content
						</h3>
						<p class="text-sm text-gray-600 mt-1">
							Content from <strong>{formatLanguageName(selectedLanguage)}</strong> 
							datasets • <strong>{selectedTopic}</strong> topic • <strong>{selectedLevel.toLowerCase()}</strong> level
						</p>
					</div>
					<div class="text-right">
						<div class="text-lg font-bold text-emerald-600">
							{previewContent.lessons.length} Lessons
						</div>
						<div class="text-xs text-gray-500">
							{previewContent.metadata?.vocabularyCount || 0} vocabulary items
						</div>
					</div>
				</div>
				
				<!-- API Sources Banner -->
				<div class="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 mb-6">
					<div class="flex items-center justify-center gap-6 text-sm">
						<div class="flex items-center gap-2 text-blue-700">
							<Database class="w-4 h-4" />
							<span>MAVEN API</span>
						</div>
						<div class="flex items-center gap-2 text-green-700">
							<Globe class="w-4 h-4" />
							<span>Igbo API</span>
						</div>
						<div class="flex items-center gap-2 text-purple-700">
							<Mic class="w-4 h-4" />
							<span>CommonVoice</span>
						</div>
						<div class="flex items-center gap-2 text-orange-700">
							<Brain class="w-4 h-4" />
							<span>Lanfrica</span>
						</div>
					</div>
				</div>
				
				<!-- Lessons Preview -->
				<div class="space-y-4">
					{#each previewContent.lessons as lesson, index}
						<LessonPreview {lesson} {index} />
					{/each}
				</div>
				
				<!-- Content Summary -->
				<div class="mt-6 p-4 bg-gray-50 rounded-lg">
					<h4 class="font-semibold text-gray-900 mb-2">Content Summary</h4>
					<div class="grid md:grid-cols-4 gap-4 text-sm">
						<div class="text-center">
							<div class="font-bold text-blue-600 text-lg">
								{previewContent.metadata?.vocabularyCount || 0}
							</div>
							<div class="text-gray-600">Vocabulary Items</div>
						</div>
						<div class="text-center">
							<div class="font-bold text-green-600 text-lg">
								{previewContent.metadata?.phrasesCount || 0}
							</div>
							<div class="text-gray-600">Common Phrases</div>
						</div>
						<div class="text-center">
							<div class="font-bold text-purple-600 text-lg">
								{previewContent.lessons.reduce((sum, lesson) => sum + (lesson.content.exercises?.length || 0), 0)}
							</div>
							<div class="text-gray-600">Exercises</div>
						</div>
						<div class="text-center">
							<div class="font-bold text-orange-600 text-lg">
								{previewContent.metadata?.audioClipsCount || 0}
							</div>
							<div class="text-gray-600">Audio Clips</div>
						</div>
					</div>
				</div>
			</div>
		{/if}		<!-- Submit Button -->
		<div class="flex items-center justify-between pt-6 border-t border-gray-200">
			<a href="/dashboard/courses" 
			   class="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium">
				Cancel
			</a>
			
			<button 
				type="submit"
				class="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
			>
				<BookOpen class="w-5 h-5" />
				{useAIGeneration ? 'Create Course with AI Content' : 'Create Course'}
			</button>
		</div>
	</form>
</div>

<style>
	.animate-spin {
		animation: spin 1s linear infinite;
	}
	
	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
</style>
