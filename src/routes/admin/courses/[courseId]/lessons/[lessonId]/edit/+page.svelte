<script lang="ts">
  import { 
    Save, 
    ArrowLeft, 
    Plus, 
    Edit3, 
    Trash2, 
    Eye, 
    EyeOff,
    BookOpen,
    Headphones,
    PlayCircle,
    MessageSquare,
    Globe,
    Clock,
    FileText,
    ChevronDown,
    ChevronRight,
    X,
    Volume2
  } from 'lucide-svelte';
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  
  const { lesson } = data;
  
  // Form data - using $state for Svelte 5 reactivity
  let title = $state(lesson.title);
  let description = $state(lesson.description || '');
  let contentHtml = $state(lesson.contentHtml || '');
  let videoUrl = $state(lesson.videoUrl || '');
  let audioUrl = $state(lesson.audioUrl || '');
  let imageUrl = $state(lesson.imageUrl || '');
  let duration = $state(lesson.duration || '');
  let culturalNotes = $state(lesson.culturalNotes || '');
  let isPublished = $state(lesson.isPublished);
  
  // Vocabulary management
  let vocabulary = $state((lesson.vocabulary as any) || []);
  let showVocabForm = $state(false);
  let editingVocab = $state<any>(null);
  
  // New vocabulary form
  let newVocab = $state({
    igbo: '',
    english: '',
    pronunciation: '',
    partOfSpeech: 'noun',
    difficulty: 'beginner',
    topic: 'general'
  });
  
  // Quiz management
  let showQuizForm = $state(false);
  let newQuiz = $state({
    type: 'MULTIPLE_CHOICE',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: ''
  });
  
  // UI state
  let activeTab = $state('content');
  let showPreview = $state(false);
  let contentEditMode = $state('structured'); // 'structured' or 'raw'
  let playingAudio = $state<string | null>(null);
  let speechSynthesis: SpeechSynthesis | null = null;
  let currentUtterance: SpeechSynthesisUtterance | null = null;
  
  // Initialize speech synthesis
  $effect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesis = window.speechSynthesis;
    }
  });
  
  // Parse and manage structured content
  let parsedContent = $derived.by(() => {
    if (!contentHtml) return null;
    try {
      return JSON.parse(contentHtml);
    } catch (e) {
      return null;
    }
  });

  // Structured content fields
  let structuredIntro = $state('');
  let structuredVocab = $state<any[]>([]);
  let structuredExamples = $state<any[]>([]);
  let structuredCultural = $state('');

  // Initialize structured content from parsed JSON
  $effect(() => {
    if (parsedContent) {
      structuredIntro = parsedContent.introduction || '';
      structuredVocab = parsedContent.vocabulary || [];
      structuredExamples = parsedContent.examples || parsedContent.practicalPhrases || [];
      structuredCultural = parsedContent.culturalNote || '';
    }
  });

  // Utility functions
  function getLanguageDisplay(lang: string): string {
    return lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();
  }

  function getStatusColor(published: boolean): string {
    return published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  }

  // Update contentHtml when structured content changes
  function updateContentFromStructured() {
    const structuredData = {
      introduction: structuredIntro,
      vocabulary: structuredVocab,
      examples: structuredExamples,
      culturalNote: structuredCultural
    };
    contentHtml = JSON.stringify(structuredData, null, 2);
  }
  
  const partOfSpeechOptions = ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction'];
  const difficultyOptions = ['beginner', 'intermediate', 'advanced'];
  const topicOptions = ['general', 'greetings', 'numbers', 'colors', 'food_and_eating', 'family', 'time', 'business', 'travel'];
  const quizTypes = ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK', 'MATCHING'];

  function addVocabulary() {
    if (!newVocab.igbo || !newVocab.english) return;
    
    const newId = Math.max(0, ...vocabulary.map((v: any) => v.id || 0)) + 1;
    vocabulary = [...vocabulary, { id: newId, ...newVocab }];
    
    // Reset form
    newVocab = {
      igbo: '',
      english: '',
      pronunciation: '',
      partOfSpeech: 'noun',
      difficulty: 'beginner',
      topic: 'general'
    };
    showVocabForm = false;
  }

  function editVocabulary(vocabItem: any) {
    editingVocab = { ...vocabItem };
  }

  function updateVocabulary() {
    vocabulary = vocabulary.map((item: any) => 
      item.id === editingVocab.id ? editingVocab : item
    );
    editingVocab = null;
  }

  function deleteVocabulary(id: number) {
    vocabulary = vocabulary.filter((item: any) => item.id !== id);
  }

  function addQuizOption() {
    newQuiz.options = [...newQuiz.options, ''];
  }

  function removeQuizOption(index: number) {
    newQuiz.options = newQuiz.options.filter((_, i) => i !== index);
  }

  function addQuiz() {
    if (!newQuiz.question || !newQuiz.correctAnswer) return;
    
    // Filter out empty options
    const cleanOptions = newQuiz.options.filter(opt => opt.trim());
    if (cleanOptions.length < 2) return;
    
    showQuizForm = false;
    // Reset form
    newQuiz = {
      type: 'MULTIPLE_CHOICE',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: ''
    };
  }

  function formatDuration(minutes: string | number | null) {
    if (minutes === null || minutes === undefined) return 'N/A';
    const mins = typeof minutes === 'string' ? parseInt(minutes) || 0 : minutes;
    if (mins === 0) return 'N/A';
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return hours > 0 ? `${hours}h ${remainingMins}m` : `${remainingMins}m`;
  }
  
  // Audio playback function
  function playAudio(text: string, itemId: string) {
    // Stop any currently playing audio
    if (speechSynthesis && currentUtterance) {
      speechSynthesis.cancel();
    }
    
    // Use Web Speech API for text-to-speech
    if (speechSynthesis && text) {
      playingAudio = itemId;
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ig-NG'; // Igbo language code
      utterance.rate = 0.8; // Slightly slower for clarity
      utterance.pitch = 1.0;
      
      // Fallback to English if Igbo voice not available
      const voices = speechSynthesis.getVoices();
      const igboVoice = voices.find(voice => voice.lang.startsWith('ig'));
      if (igboVoice) {
        utterance.voice = igboVoice;
      }
      
      utterance.onend = () => {
        playingAudio = null;
      };
      
      utterance.onerror = () => {
        playingAudio = null;
        console.warn('Speech synthesis error for:', text);
      };
      
      currentUtterance = utterance;
      speechSynthesis.speak(utterance);
    }
  }
</script>

<svelte:head>
  <title>Edit Lesson: {lesson.title} - Admin Panel</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <!-- Header -->
  <div class="flex items-center justify-between mb-8">
    <div class="flex items-center space-x-4">
      <button 
        onclick={() => goto(`/admin/courses/${lesson.course.id}`)}
        class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft class="w-5 h-5" />
        <span>Back to Course</span>
      </button>
      <div class="text-gray-400">|</div>
      <h1 class="text-2xl font-bold text-gray-900">Edit Lesson</h1>
    </div>
    
    <div class="flex items-center space-x-3">
      <button 
        onclick={() => showPreview = !showPreview}
        class={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          showPreview ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        {#if showPreview}
          <EyeOff class="w-5 h-5" />
          <span>Hide Preview</span>
        {:else}
          <Eye class="w-5 h-5" />
          <span>Preview</span>
        {/if}
      </button>
    </div>
  </div>

  {#if form?.error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-red-800">{form.error}</p>
    </div>
  {/if}

  {#if form?.success}
    <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <p class="text-green-800">Lesson updated successfully!</p>
    </div>
  {/if}

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Main Content -->
    <div class="lg:col-span-2">
      <!-- Tab Navigation -->
      <div class="bg-white rounded-lg shadow-lg mb-6">
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8 px-6">
            <button 
              onclick={() => activeTab = 'content'}
              class={`py-4 border-b-2 font-medium text-sm ${
                activeTab === 'content' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div class="flex items-center space-x-2">
                <FileText class="w-4 h-4" />
                <span>Content</span>
              </div>
            </button>
            <button 
              onclick={() => activeTab = 'vocabulary'}
              class={`py-4 border-b-2 font-medium text-sm ${
                activeTab === 'vocabulary' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div class="flex items-center space-x-2">
                <BookOpen class="w-4 h-4" />
                <span>Vocabulary ({vocabulary.length})</span>
              </div>
            </button>
            <button 
              onclick={() => activeTab = 'quizzes'}
              class={`py-4 border-b-2 font-medium text-sm ${
                activeTab === 'quizzes' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div class="flex items-center space-x-2">
                <MessageSquare class="w-4 h-4" />
                <span>Quizzes ({lesson.quizzes.length})</span>
              </div>
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          {#if activeTab === 'content'}
            <!-- Content Tab -->
            <form method="POST" action="?/updateLesson" use:enhance>
              <div class="space-y-6">
                <!-- Basic Info -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                      Lesson Title *
                    </label>
                    <input 
                      type="text" 
                      id="title" 
                      name="title" 
                      bind:value={title}
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label for="duration" class="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input 
                      type="number" 
                      id="duration" 
                      name="duration" 
                      bind:value={duration}
                      min="1"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <!-- Description -->
                <div>
                  <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea 
                    id="description" 
                    name="description" 
                    bind:value={description}
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of what this lesson covers..."
                  ></textarea>
                </div>

                <!-- Media URLs -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label for="videoUrl" class="block text-sm font-medium text-gray-700 mb-2">
                      Video URL
                    </label>
                    <input 
                      type="url" 
                      id="videoUrl" 
                      name="videoUrl" 
                      bind:value={videoUrl}
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                  
                  <div>
                    <label for="audioUrl" class="block text-sm font-medium text-gray-700 mb-2">
                      Audio URL
                    </label>
                    <input 
                      type="url" 
                      id="audioUrl" 
                      name="audioUrl" 
                      bind:value={audioUrl}
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                  
                  <div>
                    <label for="imageUrl" class="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <input 
                      type="url" 
                      id="imageUrl" 
                      name="imageUrl" 
                      bind:value={imageUrl}
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <!-- Content Editor -->
                <div>
                  <div class="flex items-center justify-between mb-4">
                    <label class="block text-sm font-medium text-gray-700">
                      Lesson Content
                    </label>
                    <!-- <div class="flex bg-gray-100 rounded-lg p-1">
                      <button
                        type="button"
                        onclick={() => contentEditMode = 'structured'}
                        class="px-3 py-1 text-sm rounded-md transition-colors {contentEditMode === 'structured' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
                      >
                        User-Friendly
                      </button>
                      <button
                        type="button"
                        onclick={() => contentEditMode = 'raw'}
                        class="px-3 py-1 text-sm rounded-md transition-colors {contentEditMode === 'raw' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
                      >
                        Raw JSON
                      </button>
                    </div> -->
                  </div>

                  {#if contentEditMode === 'structured'}
                    <!-- User-Friendly Content Editor -->
                    <div class="space-y-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      
                      <!-- Introduction -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          Introduction
                        </label>
                        <textarea
                          bind:value={structuredIntro}
                          oninput={updateContentFromStructured}
                          rows="3"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Write an engaging introduction to the lesson..."
                        ></textarea>
                      </div>

                      <!-- Vocabulary -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          Key Vocabulary
                        </label>
                        <div class="space-y-3">
                          {#each structuredVocab as vocabItem, index}
                            <div class="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-white rounded border items-center">
                              <input
                                type="text"
                                bind:value={vocabItem.igbo}
                                oninput={updateContentFromStructured}
                                placeholder="Igbo word"
                                class="px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <input
                                type="text"
                                bind:value={vocabItem.english}
                                oninput={updateContentFromStructured}
                                placeholder="English translation"
                                class="px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <input
                                type="text"
                                bind:value={vocabItem.pronunciation}
                                oninput={updateContentFromStructured}
                                placeholder="Pronunciation"
                                class="px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <div class="flex items-center gap-2">
                                <button
                                  type="button"
                                  onclick={() => playAudio(vocabItem.igbo || '', `struct-vocab-${index}`)}
                                  class="p-2 hover:bg-blue-50 rounded transition-colors"
                                  class:animate-pulse={playingAudio === `struct-vocab-${index}`}
                                  title="Play pronunciation"
                                  disabled={!vocabItem.igbo}
                                >
                                  <Volume2 class="w-4 h-4 {playingAudio === `struct-vocab-${index}` ? 'text-blue-500' : 'text-gray-400'}" />
                                </button>
                                <button
                                  type="button"
                                  onclick={() => {
                                    structuredVocab.splice(index, 1);
                                    structuredVocab = structuredVocab;
                                    updateContentFromStructured();
                                  }}
                                  class="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          {/each}
                          <button
                            type="button"
                            onclick={() => {
                              structuredVocab.push({ igbo: '', english: '', pronunciation: '' });
                              structuredVocab = structuredVocab;
                            }}
                            class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            + Add Vocabulary Item
                          </button>
                        </div>
                      </div>

                      <!-- Examples -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          Practical Examples
                        </label>
                        <div class="space-y-3">
                          {#each structuredExamples as example, index}
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-white rounded border">
                              <input
                                type="text"
                                bind:value={example.igbo}
                                oninput={updateContentFromStructured}
                                placeholder="Igbo phrase"
                                class="px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <input
                                type="text"
                                bind:value={example.english}
                                oninput={updateContentFromStructured}
                                placeholder="English translation"
                                class="px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <button
                                type="button"
                                onclick={() => {
                                  structuredExamples.splice(index, 1);
                                  structuredExamples = structuredExamples;
                                  updateContentFromStructured();
                                }}
                                class="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          {/each}
                          <button
                            type="button"
                            onclick={() => {
                              structuredExamples.push({ igbo: '', english: '' });
                              structuredExamples = structuredExamples;
                            }}
                            class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            + Add Example
                          </button>
                        </div>
                      </div>

                      <!-- Cultural Note -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          Cultural Context
                        </label>
                        <textarea
                          bind:value={structuredCultural}
                          oninput={updateContentFromStructured}
                          rows="3"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Add cultural context, traditions, or usage notes..."
                        ></textarea>
                      </div>

                    </div>
                  {:else}
                    <!-- Raw JSON Editor -->
                    <textarea 
                      id="contentHtml" 
                      name="contentHtml" 
                      bind:value={contentHtml}
                      rows="10"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      placeholder="Enter JSON content or use the User-Friendly editor above"
                    ></textarea>
                  {/if}

                  <!-- Hidden field for form submission -->
                  <input type="hidden" name="contentHtml" value={contentHtml} />
                </div>

                <!-- Cultural Notes -->
                <div>
                  <label for="culturalNotes" class="block text-sm font-medium text-gray-700 mb-2">
                    Cultural Context & Notes
                  </label>
                  <textarea 
                    id="culturalNotes" 
                    name="culturalNotes" 
                    bind:value={culturalNotes}
                    rows="4"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add cultural context, usage notes, and background information..."
                  ></textarea>
                </div>

                <!-- Hidden vocabulary field -->
                <input type="hidden" name="vocabulary" value={JSON.stringify(vocabulary)} />

                <!-- Publishing -->
                <div class="flex items-center">
                  <input 
                    type="checkbox" 
                    id="isPublished" 
                    name="isPublished" 
                    bind:checked={isPublished}
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="isPublished" class="ml-2 block text-sm text-gray-900">
                    Publish this lesson (make it visible to students)
                  </label>
                </div>

                <!-- Save Button -->
                <div class="flex justify-end">
                  <button 
                    type="submit"
                    class="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save class="w-5 h-5" />
                    <span>Save Lesson</span>
                  </button>
                </div>
              </div>
            </form>

          {:else if activeTab === 'vocabulary'}
            <!-- Vocabulary Tab -->
            <div class="space-y-6">
              <!-- Add Vocabulary Button -->
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-900">Vocabulary Management</h3>
                <button 
                  onclick={() => showVocabForm = !showVocabForm}
                  class="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus class="w-4 h-4" />
                  <span>Add Vocabulary</span>
                </button>
              </div>

              <!-- Add Vocabulary Form -->
              {#if showVocabForm}
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-900 mb-4">Add New Vocabulary</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Igbo *</label>
                      <input 
                        type="text" 
                        bind:value={newVocab.igbo}
                        placeholder="otu"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">English *</label>
                      <input 
                        type="text" 
                        bind:value={newVocab.english}
                        placeholder="one"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Pronunciation</label>
                      <input 
                        type="text" 
                        bind:value={newVocab.pronunciation}
                        placeholder="o-tu"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Part of Speech</label>
                      <select 
                        bind:value={newVocab.partOfSpeech}
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {#each partOfSpeechOptions as option}
                          <option value={option}>{option}</option>
                        {/each}
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                      <select 
                        bind:value={newVocab.difficulty}
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {#each difficultyOptions as option}
                          <option value={option}>{option}</option>
                        {/each}
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                      <select 
                        bind:value={newVocab.topic}
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {#each topicOptions as option}
                          <option value={option}>{option}</option>
                        {/each}
                      </select>
                    </div>
                  </div>
                  <div class="flex justify-end space-x-3 mt-4">
                    <button 
                      onclick={() => showVocabForm = false}
                      class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onclick={addVocabulary}
                      class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Vocabulary
                    </button>
                  </div>
                </div>
              {/if}

              <!-- Vocabulary List -->
              {#if vocabulary.length === 0}
                <div class="text-center py-12">
                  <BookOpen class="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 class="text-lg font-medium text-gray-900 mb-2">No vocabulary yet</h3>
                  <p class="text-gray-500">Add vocabulary words to help students learn.</p>
                </div>
              {:else}
                <div class="space-y-3">
                  {#each vocabulary as vocabItem, index}
                    <div class="border border-gray-200 rounded-lg p-4">
                      {#if editingVocab && editingVocab.id === vocabItem.id}
                        <!-- Edit Mode -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <input 
                              type="text" 
                              bind:value={editingVocab.igbo}
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <input 
                              type="text" 
                              bind:value={editingVocab.english}
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <input 
                              type="text" 
                              bind:value={editingVocab.pronunciation}
                              placeholder="Pronunciation"
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <select 
                              bind:value={editingVocab.partOfSpeech}
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              {#each partOfSpeechOptions as option}
                                <option value={option}>{option}</option>
                              {/each}
                            </select>
                          </div>
                        </div>
                        <div class="flex justify-end space-x-3 mt-4">
                          <button 
                            onclick={() => editingVocab = null}
                            class="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            onclick={updateVocabulary}
                            class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      {:else}
                        <!-- Display Mode -->
                        <div class="flex items-center justify-between">
                          <div class="flex-1">
                            <div class="flex items-center space-x-4">
                              <div>
                                <span class="font-semibold text-gray-900">{vocabItem.igbo}</span>
                                <span class="text-gray-400 mx-2">→</span>
                                <span class="text-gray-700">{vocabItem.english}</span>
                              </div>
                              {#if vocabItem.pronunciation}
                                <div class="text-sm text-gray-500">
                                  /{vocabItem.pronunciation}/
                                </div>
                              {/if}
                              <!-- Audio Play Button -->
                              <button 
                                type="button"
                                onclick={() => playAudio(vocabItem.igbo, `vocab-${index}`)}
                                class="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                class:animate-pulse={playingAudio === `vocab-${index}`}
                                title="Play pronunciation"
                              >
                                <Volume2 class="w-4 h-4 {playingAudio === `vocab-${index}` ? 'text-blue-500' : 'text-gray-400'}" />
                              </button>
                            </div>
                            <div class="flex items-center space-x-4 mt-1">
                              <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {vocabItem.partOfSpeech}
                              </span>
                              <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                {vocabItem.difficulty}
                              </span>
                              <span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                {vocabItem.topic}
                              </span>
                            </div>
                          </div>
                          <div class="flex items-center space-x-2">
                            <button 
                              onclick={() => editVocabulary(vocabItem)}
                              class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit3 class="w-4 h-4" />
                            </button>
                            <button 
                              onclick={() => deleteVocabulary(vocabItem.id)}
                              class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 class="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      {/if}
                    </div>
                  {/each}
                </div>
              {/if}
            </div>

          {:else if activeTab === 'quizzes'}
            <!-- Quizzes Tab -->
            <div class="space-y-6">
              <!-- Add Quiz Button -->
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-900">Quiz Management</h3>
                <button 
                  onclick={() => showQuizForm = !showQuizForm}
                  class="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus class="w-4 h-4" />
                  <span>Add Quiz</span>
                </button>
              </div>

              <!-- Add Quiz Form -->
              {#if showQuizForm}
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-900 mb-4">Add New Quiz</h4>
                  <form method="POST" action="?/addQuiz" use:enhance>
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Quiz Type</label>
                        <select 
                          name="type"
                          bind:value={newQuiz.type}
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {#each quizTypes as type}
                            <option value={type}>{type.replace('_', ' ')}</option>
                          {/each}
                        </select>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Question *</label>
                        <input 
                          type="text" 
                          name="question"
                          bind:value={newQuiz.question}
                          placeholder="What is the Igbo word for 'one'?"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Options</label>
                        <div class="space-y-2">
                          {#each newQuiz.options as option, i}
                            <div class="flex items-center space-x-2">
                              <input 
                                type="text" 
                                bind:value={newQuiz.options[i]}
                                placeholder={`Option ${i + 1}`}
                                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {#if newQuiz.options.length > 2}
                                <button 
                                  type="button"
                                  onclick={() => removeQuizOption(i)}
                                  class="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <X class="w-4 h-4" />
                                </button>
                              {/if}
                            </div>
                          {/each}
                          <button 
                            type="button"
                            onclick={addQuizOption}
                            class="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            + Add Option
                          </button>
                        </div>
                        <input type="hidden" name="options" value={JSON.stringify(newQuiz.options.filter(opt => opt.trim()))} />
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Correct Answer *</label>
                        <input 
                          type="text" 
                          name="correctAnswer"
                          bind:value={newQuiz.correctAnswer}
                          placeholder="otu"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
                        <textarea 
                          name="explanation"
                          bind:value={newQuiz.explanation}
                          rows="2"
                          placeholder="Optional explanation for the correct answer"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        ></textarea>
                      </div>
                    </div>

                    <div class="flex justify-end space-x-3 mt-4">
                      <button 
                        type="button"
                        onclick={() => showQuizForm = false}
                        class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add Quiz
                      </button>
                    </div>
                  </form>
                </div>
              {/if}

              <!-- Quiz List -->
              {#if lesson.quizzes.length === 0}
                <div class="text-center py-12">
                  <MessageSquare class="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 class="text-lg font-medium text-gray-900 mb-2">No quizzes yet</h3>
                  <p class="text-gray-500">Add interactive quizzes to test student knowledge.</p>
                </div>
              {:else}
                <div class="space-y-4">
                  {#each lesson.quizzes as quiz, index}
                    <div class="border border-gray-200 rounded-lg p-4">
                      <div class="flex items-start justify-between">
                        <div class="flex-1">
                          <div class="flex items-center space-x-2 mb-2">
                            <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {quiz.type.replace('_', ' ')}
                            </span>
                            <span class="text-sm text-gray-500">Quiz #{index + 1}</span>
                          </div>
                          <h4 class="font-semibold text-gray-900 mb-2">{quiz.question}</h4>
                          {#if quiz.options}
                            <div class="space-y-1 mb-2">
                              {#each Object.values(quiz.options) as option}
                                <div class="text-sm text-gray-600 pl-4">• {option}</div>
                              {/each}
                            </div>
                          {/if}
                          <div class="text-sm">
                            <span class="font-medium text-green-600">Correct Answer:</span> 
                            <span class="text-gray-700">{quiz.correctAnswer}</span>
                          </div>
                          {#if quiz.explanation}
                            <div class="text-sm mt-1">
                              <span class="font-medium text-gray-600">Explanation:</span> 
                              <span class="text-gray-700">{quiz.explanation}</span>
                            </div>
                          {/if}
                        </div>
                        <div class="flex items-center space-x-2">
                          <form method="POST" action="?/deleteQuiz" use:enhance>
                            <input type="hidden" name="quizId" value={quiz.id} />
                            <button 
                              type="submit"
                              class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              onclick={(e) => {
                                if (!confirm('Are you sure you want to delete this quiz?')) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              <Trash2 class="w-4 h-4" />
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <div class="lg:col-span-1">
      <!-- Lesson Info Card -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Lesson Info</h3>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-600">Course:</span>
            <span class="font-medium">{lesson.course.title}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Language:</span>
            <span class="font-medium">{getLanguageDisplay(lesson.course.language)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Order:</span>
            <span class="font-medium">#{lesson.order}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Duration:</span>
            <span class="font-medium">{formatDuration(duration || lesson.duration)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Status:</span>
            <span class={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(isPublished)}`}>
              {isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-600">Vocabulary:</span>
            <span class="font-bold text-blue-600">{vocabulary.length}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Quizzes:</span>
            <span class="font-bold text-green-600">{lesson.quizzes.length}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Has Video:</span>
            <span class="font-bold {videoUrl ? 'text-green-600' : 'text-gray-400'}">
              {videoUrl ? 'Yes' : 'No'}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Has Audio:</span>
            <span class="font-bold {audioUrl || vocabulary.length > 0 || structuredVocab.length > 0 ? 'text-green-600' : 'text-gray-400'}">
              {audioUrl || vocabulary.length > 0 || structuredVocab.length > 0 ? 'Yes' : 'No'}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Cultural Notes:</span>
            <span class="font-bold {culturalNotes ? 'text-green-600' : 'text-gray-400'}">
              {culturalNotes ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  /* Custom scrollbar */
  :global(::-webkit-scrollbar) {
    width: 8px;
  }
  
  :global(::-webkit-scrollbar-track) {
    background: #f1f1f1;
  }
  
  :global(::-webkit-scrollbar-thumb) {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  :global(::-webkit-scrollbar-thumb:hover) {
    background: #a8a8a8;
  }
  
  /* Audio playing animation */
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
