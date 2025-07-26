<script lang="ts">
  import { page } from '$app/stores';
  import { toast } from '$lib/stores/toast';
  import type { PageData } from './$types';

  export let data: PageData;

  let isGenerating = false;
  let selectedLanguage = 'IGBO';
  let selectedLevel = 'BEGINNER';
  let targetLessons = 10;

  const languages = [
    { value: 'IGBO', label: 'Igbo', description: 'With authentic Igbo API data' },
    { value: 'YORUBA', label: 'Yoruba', description: 'Traditional Yoruba content' },
    { value: 'HAUSA', label: 'Hausa', description: 'Northern Nigerian language' },
    { value: 'EFIK', label: 'Efik', description: 'Cross River state language' },
    { value: 'TIV', label: 'Tiv', description: 'Middle Belt language' }
  ];

  const levels = [
    { value: 'BEGINNER', label: 'Beginner', description: 'Basic vocabulary and phrases' },
    { value: 'INTERMEDIATE', label: 'Intermediate', description: 'Conversational skills' },
    { value: 'ADVANCED', label: 'Advanced', description: 'Fluent communication' }
  ];

  async function generateCourse() {
    if (isGenerating) return;
    
    isGenerating = true;
    
    try {
      const response = await fetch('/api/courses/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          language: selectedLanguage,
          level: selectedLevel,
          targetLessons
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Course "${result.course.title}" generated successfully! Created ${result.course.lessonsCount} lessons.`);
        
        // Refresh the page to show new course
        window.location.reload();
      } else {
        toast.error(result.error || 'Failed to generate course');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate course. Please try again.');
    } finally {
      isGenerating = false;
    }
  }

  async function togglePublishCourse(courseId: string, isCurrentlyPublished: boolean) {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isPublished: !isCurrentlyPublished,
          isApproved: !isCurrentlyPublished
        })
      });

      if (response.ok) {
        toast.success(`Course ${!isCurrentlyPublished ? 'published' : 'unpublished'} successfully!`);
        window.location.reload();
      } else {
        toast.error('Failed to update course status');
      }
    } catch (error) {
      toast.error('Failed to update course status');
    }
  }
</script>

<svelte:head>
  <title>Content Generation - NaijaLingua Admin</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">African Language Content Generation</h1>
      <p class="text-gray-600 mt-2">Generate courses using MAVEN, Igbo API, CommonVoice, and Lanfrica datasets</p>
    </div>
  </div>

  <!-- Statistics Cards -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center">
        <div class="p-2 bg-blue-500 rounded-lg">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-600">Generated Courses</p>
          <p class="text-2xl font-semibold text-gray-900">{data.stats.totalGenerated}</p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center">
        <div class="p-2 bg-green-500 rounded-lg">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-600">Published</p>
          <p class="text-2xl font-semibold text-gray-900">{data.stats.published}</p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center">
        <div class="p-2 bg-purple-500 rounded-lg">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
          </svg>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-600">Total Enrollments</p>
          <p class="text-2xl font-semibold text-gray-900">{data.stats.totalEnrollments}</p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center">
        <div class="p-2 bg-yellow-500 rounded-lg">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
          </svg>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-600">Languages</p>
          <p class="text-2xl font-semibold text-gray-900">{data.stats.languages.length}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Course Generation Form -->
  <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
    <h2 class="text-xl font-semibold mb-6">Generate New Course</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <!-- Language Selection -->
      <div>
        <label for="language" class="block text-sm font-medium text-gray-700 mb-2">
          Select Language
        </label>
        <select
          id="language"
          bind:value={selectedLanguage}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {#each languages as lang}
            <option value={lang.value}>{lang.label}</option>
          {/each}
        </select>
        <p class="text-sm text-gray-500 mt-1">
          {languages.find(l => l.value === selectedLanguage)?.description}
        </p>
      </div>

      <!-- Level Selection -->
      <div>
        <label for="level" class="block text-sm font-medium text-gray-700 mb-2">
          Select Level
        </label>
        <select
          id="level"
          bind:value={selectedLevel}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {#each levels as level}
            <option value={level.value}>{level.label}</option>
          {/each}
        </select>
        <p class="text-sm text-gray-500 mt-1">
          {levels.find(l => l.value === selectedLevel)?.description}
        </p>
      </div>

      <!-- Lessons Count -->
      <div>
        <label for="lessons" class="block text-sm font-medium text-gray-700 mb-2">
          Number of Lessons
        </label>
        <input
          id="lessons"
          type="number"
          min="5"
          max="20"
          bind:value={targetLessons}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
        <p class="text-sm text-gray-500 mt-1">
          Recommended: 10-15 lessons per course
        </p>
      </div>
    </div>

    <button
      on:click={generateCourse}
      disabled={isGenerating}
      class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
    >
      {#if isGenerating}
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Generating Course...
      {:else}
        Generate Course
      {/if}
    </button>
  </div>

  <!-- Generated Courses List -->
  <div class="bg-white rounded-lg shadow">
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="text-xl font-semibold">Generated Courses</h2>
    </div>
    
    {#if data.autoGeneratedCourses.length === 0}
      <div class="px-6 py-8 text-center text-gray-500">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No courses generated yet</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by generating your first course using African language datasets.</p>
      </div>
    {:else}
      <div class="divide-y divide-gray-200">
        {#each data.autoGeneratedCourses as course}
          <div class="px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3">
                  <h3 class="text-lg font-medium text-gray-900">{course.title}</h3>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {course.language}
                  </span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {course.level}
                  </span>
                  {#if course.isPublished}
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Published
                    </span>
                  {:else}
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Draft
                    </span>
                  {/if}
                </div>
                <p class="text-sm text-gray-600 mt-1">{course.description}</p>
                <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span>{course._count.lessons} lessons</span>
                  <span>{course._count.enrollments} enrollments</span>
                  <span>Created {new Date(course.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <a
                  href="/admin/courses/{course.id}"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </a>
                <button
                  on:click={() => togglePublishCourse(course.id, course.isPublished)}
                  class="text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  {course.isPublished ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
