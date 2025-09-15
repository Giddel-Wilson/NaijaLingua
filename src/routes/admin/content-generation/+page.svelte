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
    Zap,
    TrendingUp,
    Bot,
    ChevronRight,
    Plus,
    BarChart3
  } from 'lucide-svelte';
  import LessonPreview from '$lib/components/LessonPreview.svelte';
  import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
  import ToastContainer from '$lib/components/ToastContainer.svelte';
  import { toasts } from '$lib/stores/toast';
  import type { PageData, ActionData } from './$types';

  interface PreviewContent {
    lessons: Array<{
      title: string;
      description: string;
      type: string;
      content: {
        exercises?: Array<any>;
      };
      audioContent?: any[];
    }>;
    metadata?: {
      vocabularyCount?: number;
      phrasesCount?: number;
      audioClipsCount?: number;
    };
  }

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let useAIGeneration = $state(true);
  let selectedLanguage = $state('igbo');
  let selectedLevel = $state('BEGINNER');
  let selectedTopic = $state('greetings');
  let isGenerating = $state(false);
  let isCreatingCourse = $state(false);
  let previewContent = $state<PreviewContent | null>(null);
  let showPreview = $state(false);
  
  // Confirmation modal state
  let showConfirmationModal = $state(false);
  let pendingFormSubmission: HTMLFormElement | null = $state(null);
  let courseTitle = $state('');

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
          topic: selectedTopic,
          preview: true  // Add preview flag to prevent saving to database
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        previewContent = result;
        showPreview = true;
      } else {
        console.error('Preview failed:', result.error);
        toasts.add({
          message: 'Failed to generate preview content. Please try again.',
          type: 'error',
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Preview error:', error);
      toasts.add({
        message: 'Error generating preview. Please check your connection and try again.',
        type: 'error',
        duration: 4000
      });
    } finally {
      isGenerating = false;
    }
  }

  // Prevent accidental form submission
  function validateForm(event: SubmitEvent) {
    const target = event.target as HTMLFormElement;
    const formData = new FormData(target);
    const title = formData.get('title') as string;
    
    // Prevent form submission initially
    event.preventDefault();
    
    if (!title || title.trim().length < 3) {
      toasts.add({
        message: 'Please enter a course title with at least 3 characters.',
        type: 'error',
        duration: 4000
      });
      return false;
    }
    
    // Additional validation for AI content
    if (useAIGeneration) {
      if (!selectedLanguage || !selectedLevel || !selectedTopic) {
        toasts.add({
          message: 'Please select language, level, and topic for AI content generation.',
          type: 'error',
          duration: 4000
        });
        return false;
      }
    }

    // Show confirmation modal
    courseTitle = title;
    pendingFormSubmission = target;
    showConfirmationModal = true;
    
    return false;
  }

  // Handle confirmation modal response
  function handleConfirmCourseCreation() {
    if (pendingFormSubmission) {
      // Add a toast to indicate course creation is starting
      toasts.add({
        message: 'Creating course... This may take a few moments.',
        type: 'info',
        duration: 3000
      });

      // Close the confirmation modal immediately
      showConfirmationModal = false;

      // Remove the onsubmit handler temporarily to avoid infinite loop
      const originalOnSubmit = pendingFormSubmission.onsubmit;
      pendingFormSubmission.onsubmit = null;
      
      // Submit the form
      pendingFormSubmission.requestSubmit();
      
      // Restore the handler
      pendingFormSubmission.onsubmit = originalOnSubmit;
    }
  }

  function handleCancelCourseCreation() {
    pendingFormSubmission = null;
    courseTitle = '';
  }

  // Prevent form submission when clicking non-submit buttons
  function preventFormSubmission(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }
</script>

<svelte:head>
  <title>Content Generation - Admin Panel</title>
</svelte:head>

<div class="mx-auto">
  <!-- Header -->
  <div class="mb-8">
    <div class="flex items-center gap-3 mb-4">
      <div class="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
        <Sparkles class="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Igbo Course Generation</h1>
        <p class="text-gray-600">Create engaging Igbo language courses with AI-powered content from authentic sources</p>
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
            🇳🇬 Powered by Igbo Language APIs
          </h3>
          <div class="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div class="flex items-center gap-2">
              <Globe class="w-4 h-4 text-green-500" />
              <span><strong>Igbo API:</strong> Authentic Igbo vocabulary and examples</span>
            </div>
            <div class="flex items-center gap-2">
              <Database class="w-4 h-4 text-blue-500" />
              <span><strong>MAVEN API:</strong> Comprehensive Igbo language datasets</span>
            </div>
            <div class="flex items-center gap-2">
              <Mic class="w-4 h-4 text-purple-500" />
              <span><strong>CommonVoice:</strong> Real audio from native Igbo speakers</span>
            </div>
            <div class="flex items-center gap-2">
              <Brain class="w-4 h-4 text-orange-500" />
              <span><strong>Lanfrica:</strong> Curated Igbo language corpus</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Stats Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <BookOpen class="h-6 w-6 text-blue-600" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">
                Total Courses
              </dt>
              <dd class="text-lg font-medium text-gray-900">
                {data.stats.totalCourses}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Bot class="h-6 w-6 text-purple-600" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">
                AI Generated
              </dt>
              <dd class="text-lg font-medium text-gray-900">
                {data.stats.autoGeneratedCourses}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Users class="h-6 w-6 text-green-600" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">
                Total Lessons
              </dt>
              <dd class="text-lg font-medium text-gray-900">
                {data.stats.totalLessons}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <TrendingUp class="h-6 w-6 text-orange-600" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">
                Generation Rate
              </dt>
              <dd class="text-lg font-medium text-gray-900">
                {data.stats.generationRate}%
              </dd>
            </dl>
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
        <a href="/admin/courses/{form.courseId}" 
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

  <form method="POST" action="?/createCourse" use:enhance={({ formElement, formData, action, cancel, submitter }) => {
    // Start loading state
    isCreatingCourse = true;
    
    return async ({ result, update }) => {
      // Handle different result types
      if (result.type === 'success') {
        // Show success toast
        toasts.add({
          message: result.data?.message || 'Course created successfully!',
          type: 'success',
          duration: 5000
        });
        
        // Update the page to show the success state
        await update();
        
        // Close confirmation modal if open
        showConfirmationModal = false;
        
        // Reset form state
        pendingFormSubmission = null;
        courseTitle = '';
      } else if (result.type === 'failure') {
        // Show error toast
        toasts.add({
          message: result.data?.error || 'Failed to create course. Please try again.',
          type: 'error',
          duration: 5000
        });
        
        // Update the page to show error state
        await update();
        
        // Close confirmation modal
        showConfirmationModal = false;
        pendingFormSubmission = null;
        courseTitle = '';
      } else {
        // For other result types, use default behavior
        await update();
      }
      
      // End loading state
      isCreatingCourse = false;
    };
  }} class="space-y-8" onsubmit={validateForm}>
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
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          onkeydown={(event) => { if(event.key === 'Enter' && !event.shiftKey) event.preventDefault(); }}
        ></textarea>
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
            class="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
          />
          <span class="text-sm font-medium text-gray-700">
            Generate Igbo course content automatically using specialized APIs
          </span>
        </label>
        <p class="text-sm text-gray-500 mt-2 ml-8">
          Create lessons, vocabulary, phrases, and exercises from authentic Igbo language datasets
        </p>
      </div>
      
      {#if useAIGeneration}
        <div class="space-y-6 p-4 bg-gray-50 rounded-lg">
          <!-- Fixed Language Display -->
          <div class="bg-white rounded-lg p-4 border border-green-200">
            <div class="flex items-center gap-3">
              <div class="text-2xl">🇳🇬</div>
              <div>
                <h4 class="font-semibold text-gray-900">Igbo Language</h4>
                <p class="text-sm text-gray-600">Content will be generated in Igbo (Asụsụ Igbo)</p>
              </div>
            </div>
          </div>
          
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label for="level" class="block text-sm font-medium text-gray-700 mb-2">
                Level *
              </label>
              <select 
                id="level" 
                name="level" 
                bind:value={selectedLevel}
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {#each data.contentTopics as topic}
                  <option value={topic}>{topic.charAt(0).toUpperCase() + topic.slice(1).replace('_', ' ')}</option>
                {/each}
              </select>
            </div>
          </div>
          
          <!-- Hidden input for language -->
          <input type="hidden" name="language" value="igbo" />
          
          <div class="flex items-center gap-4">
            <button 
              type="button"
              onclick={(event) => { preventFormSubmission(event); previewAIContent(); }}
              disabled={isGenerating}
              class="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
            >
              {#if isGenerating}
                <div class="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                Generating Igbo Content...
              {:else}
                <Brain class="w-4 h-4" />
                Preview Igbo Content
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
        <input type="hidden" name="language" value="igbo" />
        <input type="hidden" name="level" value="BEGINNER" />
        <div class="p-4 bg-blue-50 rounded-lg">
          <p class="text-sm text-blue-800">
            📚 Manual course creation mode - content will be created for Igbo language at beginner level.
          </p>
        </div>
      {/if}
    </div>
    
    <!-- Enhanced Preview Generated Content -->
    {#if showPreview && previewContent?.lessons}
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
              �🇬 Generated Igbo Language Content
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              Content from <strong>Igbo (Asụsụ Igbo)</strong> 
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
        
        <!-- Igbo API Sources Banner -->
        <div class="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 mb-6">
          <div class="flex items-center justify-center gap-6 text-sm">
            <div class="flex items-center gap-2 text-green-700">
              <Globe class="w-4 h-4" />
              <span>Igbo API</span>
            </div>
            <div class="flex items-center gap-2 text-blue-700">
              <Database class="w-4 h-4" />
              <span>MAVEN API</span>
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
                {previewContent.lessons.reduce((sum: number, lesson: any) => sum + (lesson.content.exercises?.length || 0), 0)}
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
    {/if}

    <!-- Submit Button -->
    <div class="flex items-center justify-between pt-6 border-t border-gray-200">
      <a href="/admin" 
         class="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium">
        Cancel
      </a>
      
      <button 
        type="submit"
        disabled={isCreatingCourse}
        class="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {#if isCreatingCourse}
          <div class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
          Creating Course...
        {:else}
          <Sparkles class="w-5 h-5" />
          {useAIGeneration ? 'Create Igbo Course with AI' : 'Create Igbo Course'}
        {/if}
      </button>
    </div>
  </form>

  <!-- Recent Generated Content -->
  {#if data.recentGeneratedContent.length > 0}
    <div class="bg-white shadow rounded-lg mt-8">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
          Recent Generated Igbo Content
        </h3>
        
        <div class="flow-root">
          <ul class="-my-5 divide-y divide-gray-200">
            {#each data.recentGeneratedContent as course}
              <li class="py-4">
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <Bot class="h-8 w-8 text-purple-600" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {course.title}
                    </p>
                    <p class="text-sm text-gray-500">
                      {course.language} • {course.level} • Created by {course.createdBy?.name || 'System'}
                    </p>
                  </div>
                  <div class="flex-shrink-0 text-sm text-gray-500">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </div>
                  <div class="flex-shrink-0">
                    <ChevronRight class="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </div>
  {/if}
</div>

<!-- Confirmation Modal -->
<ConfirmationModal
  bind:isOpen={showConfirmationModal}
  title="Create Igbo Course"
  message="Are you sure you want to create the course '{courseTitle}'? This action will generate the course content and make it available to students."
  confirmText="Create Course"
  cancelText="Cancel"
  variant="info"
  onConfirm={handleConfirmCourseCreation}
  onCancel={handleCancelCourseCreation}
/>

<!-- Toast Container for notifications -->
<ToastContainer />

<style>
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>
