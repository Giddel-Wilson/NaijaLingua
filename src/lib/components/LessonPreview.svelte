<script lang="ts">
	import { 
		Play, 
		Volume2, 
		Eye, 
		BookOpen, 
		CheckCircle, 
		Users, 
		Globe,
		Headphones,
		MessageCircle
	} from 'lucide-svelte';
	
	interface Lesson {
		title: string;
		description: string;
		type: string;
		content: any;
		audioContent?: any[];
	}
	
	interface Props {
		lesson: Lesson;
		index: number;
	}
	
	let { lesson, index }: Props = $props();
	
	let isExpanded = $state(false);
	let currentAudio = $state<HTMLAudioElement | null>(null);
	let playingAudio = $state<string | null>(null);
	
	function toggleExpand() {
		isExpanded = !isExpanded;
	}
	
	function playAudio(audioUrl: string, wordId: string) {
		if (currentAudio) {
			currentAudio.pause();
		}
		
		// For demo purposes, we'll simulate audio playback
		playingAudio = wordId;
		setTimeout(() => {
			playingAudio = null;
		}, 2000);
	}
	
	function getTypeIcon(type: string) {
		switch (type) {
			case 'vocabulary': return BookOpen;
			case 'phrases': return MessageCircle;
			case 'conversation': return Users;
			case 'culture': return Globe;
			default: return BookOpen;
		}
	}
	
	function getTypeColor(type: string) {
		switch (type) {
			case 'vocabulary': return 'bg-blue-100 text-blue-600';
			case 'phrases': return 'bg-green-100 text-green-600';
			case 'conversation': return 'bg-purple-100 text-purple-600';
			case 'culture': return 'bg-orange-100 text-orange-600';
			default: return 'bg-gray-100 text-gray-600';
		}
	}
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
	<!-- Lesson Header -->
	<div class="p-6 border-b border-gray-100">
		<div class="flex items-start justify-between">
			<div class="flex items-start gap-4">
				<div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
					{index + 1}
				</div>
				<div class="flex-1">
					<div class="flex items-center gap-2 mb-2">
						<h3 class="text-xl font-semibold text-gray-900">{lesson.title}</h3>
						<div class="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium {getTypeColor(lesson.type)}">
							<svelte:component this={getTypeIcon(lesson.type)} class="w-3 h-3" />
							{lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}
						</div>
					</div>
					<p class="text-gray-600">{lesson.description}</p>
					
					<!-- Lesson Stats -->
					<div class="flex items-center gap-4 mt-3 text-sm text-gray-500">
						{#if lesson.content.words?.length}
							<div class="flex items-center gap-1">
								<BookOpen class="w-4 h-4" />
								{lesson.content.words.length} vocabulary
							</div>
						{/if}
						{#if lesson.content.phrases?.length}
							<div class="flex items-center gap-1">
								<MessageCircle class="w-4 h-4" />
								{lesson.content.phrases.length} phrases
							</div>
						{/if}
						{#if lesson.content.exercises?.length}
							<div class="flex items-center gap-1">
								<CheckCircle class="w-4 h-4" />
								{lesson.content.exercises.length} exercises
							</div>
						{/if}
						{#if lesson.audioContent?.length}
							<div class="flex items-center gap-1">
								<Headphones class="w-4 h-4" />
								{lesson.audioContent.length} audio clips
							</div>
						{/if}
					</div>
				</div>
			</div>
			
			<button 
				type="button"
				onclick={toggleExpand}
				class="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
			>
				<Eye class="w-4 h-4" />
				{isExpanded ? 'Hide' : 'View'} Content
			</button>
		</div>
	</div>
	
	<!-- Expandable Content -->
	{#if isExpanded}
		<div class="p-6 space-y-6">
			<!-- Vocabulary Section -->
			{#if lesson.content.words?.length}
				<div>
					<h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
						<BookOpen class="w-5 h-5 text-blue-500" />
						Vocabulary ({lesson.content.words.length} words)
					</h4>
					<div class="grid md:grid-cols-2 gap-4">
						{#each lesson.content.words.slice(0, 8) as word, wordIndex}
							<div class="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
								<div class="flex items-center justify-between">
									<div class="flex-1">
										<div class="font-semibold text-gray-900 text-lg">
											{word.word || word.igbo}
										</div>
										<div class="text-gray-600">
											{word.translation || word.english}
										</div>
										{#if word.pronunciation}
											<div class="text-sm text-gray-500 mt-1">
												/{word.pronunciation}/
											</div>
										{/if}
									</div>
									<button 
										type="button"
										onclick={() => playAudio('audio-url', `${index}-${wordIndex}`)}
										class="p-2 hover:bg-white rounded-lg transition-colors"
										class:animate-pulse={playingAudio === `${index}-${wordIndex}`}
									>
										<Volume2 class="w-4 h-4 text-gray-400" />
									</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
			
			<!-- Phrases Section -->
			{#if lesson.content.phrases?.length}
				<div>
					<h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
						<MessageCircle class="w-5 h-5 text-green-500" />
						Common Phrases ({lesson.content.phrases.length} phrases)
					</h4>
					<div class="space-y-3">
						{#each lesson.content.phrases.slice(0, 6) as phrase, phraseIndex}
							<div class="bg-green-50 rounded-lg p-4 hover:bg-green-100 transition-colors">
								<div class="flex items-center justify-between">
									<div class="flex-1">
										<div class="font-semibold text-gray-900">
											{phrase.phrase}
										</div>
										<div class="text-gray-600">
											{phrase.translation}
										</div>
										{#if phrase.context}
											<div class="text-sm text-green-600 mt-1">
												Context: {phrase.context}
											</div>
										{/if}
									</div>
									<button 
										type="button"
										onclick={() => playAudio('phrase-audio', `phrase-${index}-${phraseIndex}`)}
										class="p-2 hover:bg-white rounded-lg transition-colors"
										class:animate-pulse={playingAudio === `phrase-${index}-${phraseIndex}`}
									>
										<Volume2 class="w-4 h-4 text-gray-400" />
									</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
			
			<!-- Dialogues Section -->
			{#if lesson.content.dialogues?.length}
				<div>
					<h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
						<Users class="w-5 h-5 text-purple-500" />
						Conversations
					</h4>
					{#each lesson.content.dialogues as dialogue}
						<div class="bg-purple-50 rounded-lg p-4">
							<h5 class="font-medium text-gray-900 mb-3">{dialogue.title}</h5>
							<div class="space-y-2">
								{#each dialogue.lines as line}
									<div class="flex gap-3">
										<div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-medium flex-shrink-0">
											{line.speaker === 0 ? 'A' : 'B'}
										</div>
										<div class="flex-1">
											<div class="font-medium text-gray-900">{line.text}</div>
											<div class="text-gray-600 text-sm">{line.translation}</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
			
			<!-- Cultural Notes Section -->
			{#if lesson.content.culturalNotes}
				<div>
					<h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
						<Globe class="w-5 h-5 text-orange-500" />
						Cultural Context
					</h4>
					<div class="bg-orange-50 rounded-lg p-4">
						<p class="text-gray-700 leading-relaxed">{lesson.content.culturalNotes}</p>
					</div>
				</div>
			{/if}
			
			<!-- Exercises Preview -->
			{#if lesson.content.exercises?.length}
				<div>
					<h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
						<CheckCircle class="w-5 h-5 text-emerald-500" />
						Interactive Exercises ({lesson.content.exercises.length} exercises)
					</h4>
					<div class="grid md:grid-cols-2 gap-4">
						{#each lesson.content.exercises as exercise, exerciseIndex}
							<div class="bg-emerald-50 rounded-lg p-4">
								<div class="font-medium text-gray-900 mb-2">
									Exercise {exerciseIndex + 1}: {exercise.type.replace('_', ' ').toUpperCase()}
								</div>
								<div class="text-gray-600 text-sm">
									{exercise.question}
								</div>
								{#if exercise.options}
									<div class="mt-2 text-xs text-emerald-600">
										{exercise.options.length} options available
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.animate-pulse {
		animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
	
	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: .5;
		}
	}
</style>
