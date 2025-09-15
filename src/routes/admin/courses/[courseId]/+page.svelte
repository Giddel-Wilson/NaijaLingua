<script lang="ts">
  import { 
    BookOpen, 
    Plus, 
    Edit3, 
    Trash2, 
    Eye, 
    Users, 
    Clock, 
    Globe, 
    CheckCircle, 
    XCircle,
    ArrowLeft,
    Settings,
    BarChart3,
    PlayCircle,
    FileText,
    Headphones,
    MessageSquare
  } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  
  const { course } = data;

  function formatDuration(minutes: number | null) {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString();
  }

  function getLanguageDisplay(lang: string) {
    return lang.charAt(0) + lang.slice(1).toLowerCase();
  }

  function getLevelColor(level: string) {
    switch (level) {
      case 'BEGINNER': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusColor(isPublished: boolean) {
    return isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  }
</script>

<svelte:head>
  <title>Course: {course.title} - Admin Panel</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <!-- Header -->
  <div class="flex items-center justify-between mb-8">
    <div class="flex items-center space-x-4">
      <button 
        onclick={() => goto('/admin/courses')}
        class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft class="w-5 h-5" />
        <span>Back to Courses</span>
      </button>
    </div>
  </div>

  <!-- Course Info Card -->
  <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
    <div class="flex flex-col lg:flex-row lg:items-start space-y-4 lg:space-y-0 lg:space-x-6">
      <!-- Course Image -->
      <div class="flex-shrink-0">
        {#if course.imageUrl}
          <img src={course.imageUrl} alt={course.title} class="w-48 h-32 object-cover rounded-lg" />
        {:else}
          <div class="w-48 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
            <BookOpen class="w-12 h-12 text-gray-400" />
          </div>
        {/if}
      </div>

      <!-- Course Details -->
      <div class="flex-1">
        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
            <p class="text-gray-600 mb-4">{course.description || 'No description available'}</p>
            
            <div class="flex flex-wrap gap-4 mb-4">
              <div class="flex items-center space-x-2">
                <Globe class="w-4 h-4 text-gray-500" />
                <span class="text-sm font-medium">{getLanguageDisplay(course.language)}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                  {course.level}
                </span>
              </div>
              <div class="flex items-center space-x-2">
                <span class={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.isPublished)}`}>
                  {course.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <div class="flex items-center space-x-2">
                <Users class="w-4 h-4 text-gray-500" />
                <span class="text-sm">{course._count.enrollments} students</span>
              </div>
            </div>
          </div>
          
          <div class="text-right">
            <div class="text-sm text-gray-500">
              Created {formatDate(course.createdAt)}
            </div>
          </div>
        </div>

        <!-- Course Stats -->
        <div class="border-t pt-4 mt-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{course.lessons.length}</div>
              <div class="text-sm text-gray-500">Lessons</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{course.lessons.filter(l => l.isPublished).length}</div>
              <div class="text-sm text-gray-500">Published</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-yellow-600">{course.lessons.reduce((sum, l) => sum + l.quizzes.length, 0)}</div>
              <div class="text-sm text-gray-500">Quizzes</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">{course.lessons.reduce((sum, l) => sum + (l.duration || 0), 0)}</div>
              <div class="text-sm text-gray-500">Total Minutes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Lessons Section -->
  <div class="bg-white rounded-lg shadow-lg">
    <div class="p-6 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-900">Lessons</h2>
        <button 
          onclick={() => goto(`/admin/courses/${course.id}/lessons/new`)}
          class="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus class="w-5 h-5" />
          <span>Add Lesson</span>
        </button>
      </div>
    </div>

    <div class="p-6">
      {#if course.lessons.length === 0}
        <div class="text-center py-12">
          <BookOpen class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">No lessons yet</h3>
          <p class="text-gray-500 mb-6">Start building your course by adding the first lesson.</p>
          <button 
            onclick={() => goto(`/admin/courses/${course.id}/lessons/new`)}
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Lesson
          </button>
        </div>
      {:else}
        <div class="space-y-4">
          {#each course.lessons as lesson, index}
            <div class="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4 flex-1">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span class="text-blue-600 font-semibold">{lesson.order}</span>
                    </div>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-semibold text-gray-900 truncate">{lesson.title}</h3>
                    <p class="text-gray-500 text-sm truncate">{lesson.description || 'No description'}</p>
                    
                    <div class="flex items-center space-x-4 mt-2">
                      <div class="flex items-center space-x-1">
                        <Clock class="w-4 h-4 text-gray-400" />
                        <span class="text-sm text-gray-500">{formatDuration(lesson.duration)}</span>
                      </div>
                      
                      {#if lesson.videoUrl}
                        <div class="flex items-center space-x-1">
                          <PlayCircle class="w-4 h-4 text-green-500" />
                          <span class="text-sm text-green-600">Video</span>
                        </div>
                      {/if}
                      
                      {#if lesson.audioUrl}
                        <div class="flex items-center space-x-1">
                          <Headphones class="w-4 h-4 text-blue-500" />
                          <span class="text-sm text-blue-600">Audio</span>
                        </div>
                      {/if}
                      
                      {#if lesson.vocabulary}
                        <div class="flex items-center space-x-1">
                          <FileText class="w-4 h-4 text-purple-500" />
                          <span class="text-sm text-purple-600">{Object.keys(lesson.vocabulary).length} vocabulary</span>
                        </div>
                      {/if}
                      
                      {#if lesson.quizzes.length > 0}
                        <div class="flex items-center space-x-1">
                          <MessageSquare class="w-4 h-4 text-orange-500" />
                          <span class="text-sm text-orange-600">{lesson.quizzes.length} quizzes</span>
                        </div>
                      {/if}
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <span class={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lesson.isPublished)}`}>
                    {lesson.isPublished ? 'Published' : 'Draft'}
                  </span>
                  
                  <div class="flex items-center space-x-1">
                    <a 
                      href="/admin/courses/{course.id}/lessons/{lesson.id}/preview"
                      class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center"
                      title="Preview Lesson"
                    >
                      <Eye class="w-4 h-4" />
                    </a>
                    
                    <a 
                      href="/admin/courses/{course.id}/lessons/{lesson.id}/edit"
                      class="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors inline-flex items-center"
                      title="Edit Lesson"
                    >
                      <Edit3 class="w-4 h-4" />
                    </a>
                    
                    <a 
                      href="/admin/courses/{course.id}/lessons/{lesson.id}/quizzes"
                      class="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors inline-flex items-center"
                      title="Manage Quizzes"
                    >
                      <MessageSquare class="w-4 h-4" />
                    </a>
                    
                    <button 
                      class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Lesson"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
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
</style>
