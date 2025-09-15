<script lang="ts">
  import { 
    Save, 
    ArrowLeft, 
    BookOpen,
    Globe,
    Clock,
    FileText,
    AlertCircle
  } from 'lucide-svelte';
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  
  const { course, nextOrder } = data;
  
  // Form data - using $state for Svelte 5 reactivity
  let title = $state('');
  let description = $state('');
  let contentHtml = $state('');
  let videoUrl = $state('');
  let audioUrl = $state('');
  let imageUrl = $state('');
  let duration = $state('');
  let order = $state(nextOrder);
  let culturalNotes = $state('');
  let isPublished = $state(false);
  let vocabulary = $state('[]');
  
  // UI state
  let isSubmitting = $state(false);
  let contentEditMode = $state('structured'); // 'structured' or 'raw'
  
  // Structured content fields
  let structuredIntro = $state('');
  let structuredVocab = $state<any[]>([]);
  let structuredExamples = $state<any[]>([]);
  let structuredCultural = $state('');

  // Utility functions
  function getLanguageDisplay(lang: string): string {
    return lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();
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

  // Add vocabulary item
  function addVocabularyItem() {
    structuredVocab = [...structuredVocab, { igbo: '', english: '', pronunciation: '' }];
    updateContentFromStructured();
  }

  // Remove vocabulary item
  function removeVocabularyItem(index: number) {
    structuredVocab = structuredVocab.filter((_, i) => i !== index);
    updateContentFromStructured();
  }

  // Add example
  function addExample() {
    structuredExamples = [...structuredExamples, { igbo: '', english: '' }];
    updateContentFromStructured();
  }

  // Remove example
  function removeExample(index: number) {
    structuredExamples = structuredExamples.filter((_, i) => i !== index);
    updateContentFromStructured();
  }

  // Initialize with some default structured content
  $effect(() => {
    if (contentEditMode === 'structured' && !contentHtml) {
      const defaultContent = {
        introduction: '',
        vocabulary: [],
        examples: [],
        culturalNote: ''
      };
      contentHtml = JSON.stringify(defaultContent, null, 2);
    }
  });
</script>

<svelte:head>
  <title>Create New Lesson - {course.title} - Admin Panel</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <!-- Header -->
  <div class="flex items-center justify-between mb-8">
    <div class="flex items-center space-x-4">
      <a 
        href="/admin/courses/{course.id}"
        class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft class="w-5 h-5" />
        <span>Back to Course</span>
      </a>
      <div class="h-6 w-px bg-gray-300"></div>
      <div class="flex items-center space-x-2">
        <BookOpen class="w-6 h-6 text-green-600" />
        <h1 class="text-2xl font-bold text-gray-900">Create New Lesson</h1>
      </div>
    </div>
  </div>

  <!-- Course Info -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
    <div class="flex items-center space-x-4">
      <div class="flex items-center space-x-2">
        <Globe class="w-4 h-4 text-blue-600" />
        <span class="font-medium text-blue-900">Course: {course.title}</span>
      </div>
      <div class="flex items-center space-x-2">
        <FileText class="w-4 h-4 text-blue-600" />
        <span class="text-blue-700">{getLanguageDisplay(course.language)} - {course.level}</span>
      </div>
    </div>
  </div>

  <!-- Error Display -->
  {#if form?.error}
    <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-center space-x-2">
        <AlertCircle class="w-5 h-5 text-red-600" />
        <p class="text-red-700">{form.error}</p>
      </div>
    </div>
  {/if}

  <!-- Form -->
  <form method="POST" action="?/create" use:enhance={() => {
    isSubmitting = true;
    return async ({ update }) => {
      isSubmitting = false;
      await update();
    };
  }}>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Content -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Lesson Details</h2>
          
          <!-- Basic Info -->
          <div class="space-y-6">
            <!-- Title -->
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                Lesson Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                bind:value={title}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter lesson title..."
                required
              />
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
                placeholder="Brief description of the lesson..."
              ></textarea>
            </div>

            <!-- Order and Duration -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="order" class="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Order
                </label>
                <input
                  type="number"
                  id="order"
                  name="order"
                  bind:value={order}
                  min="1"
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
                  placeholder="e.g., 15"
                />
              </div>
            </div>

            <!-- Content Section -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <label class="block text-sm font-medium text-gray-700">
                  Lesson Content
                </label>
                <div class="flex items-center space-x-2">
                  <button
                    type="button"
                    onclick={() => contentEditMode = 'structured'}
                    class={`px-3 py-1 text-xs rounded ${contentEditMode === 'structured' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    Structured
                  </button>
                  <button
                    type="button"
                    onclick={() => contentEditMode = 'raw'}
                    class={`px-3 py-1 text-xs rounded ${contentEditMode === 'raw' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    Raw JSON
                  </button>
                </div>
              </div>

              {#if contentEditMode === 'structured'}
                <!-- Structured Content Editor -->
                <div class="space-y-6 p-4 border border-gray-200 rounded-lg">
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
                      placeholder="Introduce the lesson topic..."
                    ></textarea>
                  </div>

                  <!-- Vocabulary -->
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-medium text-gray-700">
                        Key Vocabulary
                      </label>
                      <button
                        type="button"
                        onclick={addVocabularyItem}
                        class="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Add Word
                      </button>
                    </div>
                    <div class="space-y-3">
                      {#each structuredVocab as vocabItem, index}
                        <div class="grid grid-cols-3 gap-3 p-3 border border-gray-200 rounded">
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
                          <div class="flex items-center space-x-2">
                            <input
                              type="text"
                              bind:value={vocabItem.pronunciation}
                              oninput={updateContentFromStructured}
                              placeholder="Pronunciation"
                              class="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <button
                              type="button"
                              onclick={() => removeVocabularyItem(index)}
                              class="text-red-600 hover:text-red-800 text-sm"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      {/each}
                    </div>
                  </div>

                  <!-- Examples -->
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-medium text-gray-700">
                        Practical Examples
                      </label>
                      <button
                        type="button"
                        onclick={addExample}
                        class="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Add Example
                      </button>
                    </div>
                    <div class="space-y-3">
                      {#each structuredExamples as example, index}
                        <div class="grid grid-cols-2 gap-3 p-3 border border-gray-200 rounded">
                          <input
                            type="text"
                            bind:value={example.igbo}
                            oninput={updateContentFromStructured}
                            placeholder="Igbo phrase"
                            class="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <div class="flex items-center space-x-2">
                            <input
                              type="text"
                              bind:value={example.english}
                              oninput={updateContentFromStructured}
                              placeholder="English translation"
                              class="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <button
                              type="button"
                              onclick={() => removeExample(index)}
                              class="text-red-600 hover:text-red-800 text-sm"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      {/each}
                    </div>
                  </div>

                  <!-- Cultural Context -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Cultural Context
                    </label>
                    <textarea
                      bind:value={structuredCultural}
                      oninput={updateContentFromStructured}
                      rows="3"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Cultural notes and context..."
                    ></textarea>
                  </div>
                </div>
              {:else}
                <!-- Raw JSON Editor -->
                <textarea
                  name="contentHtml"
                  bind:value={contentHtml}
                  rows="12"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="Enter lesson content as JSON..."
                ></textarea>
              {/if}

              <!-- Hidden field for structured content -->
              {#if contentEditMode === 'structured'}
                <input type="hidden" name="contentHtml" value={contentHtml} />
              {/if}
            </div>

            <!-- Media URLs -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <!-- Cultural Notes -->
            <div>
              <label for="culturalNotes" class="block text-sm font-medium text-gray-700 mb-2">
                Cultural Notes
              </label>
              <textarea
                id="culturalNotes"
                name="culturalNotes"
                bind:value={culturalNotes}
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional cultural context and notes..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Publishing</h3>
          
          <!-- Publish Status -->
          <div class="mb-6">
            <label class="flex items-center space-x-3">
              <input
                type="checkbox"
                name="isPublished"
                bind:checked={isPublished}
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="text-sm font-medium text-gray-700">Publish immediately</span>
            </label>
            <p class="text-xs text-gray-500 mt-1">
              {isPublished ? 'Lesson will be visible to students' : 'Lesson will be saved as draft'}
            </p>
          </div>

          <!-- Actions -->
          <div class="space-y-3">
            <button
              type="submit"
              disabled={isSubmitting || !title}
              class="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save class="w-4 h-4" />
              <span>{isSubmitting ? 'Creating...' : 'Create Lesson'}</span>
            </button>
            
            <a
              href="/admin/courses/{course.id}"
              class="w-full flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <span>Cancel</span>
            </a>
          </div>

          <!-- Quick Info -->
          <div class="mt-6 pt-6 border-t border-gray-200">
            <h4 class="text-sm font-medium text-gray-700 mb-3">Quick Info</h4>
            <div class="space-y-2 text-sm text-gray-600">
              <div class="flex items-center space-x-2">
                <Clock class="w-4 h-4" />
                <span>Order: {order}</span>
              </div>
              <div class="flex items-center space-x-2">
                <FileText class="w-4 h-4" />
                <span>Course: {course.title}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </form>
</div>
