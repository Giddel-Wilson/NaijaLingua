<script lang="ts">
  import { 
    Search, 
    Filter, 
    MoreHorizontal, 
    Eye, 
    CheckCircle, 
    XCircle, 
    Trash2,
    Globe,
    BookOpen,
    Users,
    DollarSign,
    TrendingUp,
    Download,
    ChevronLeft,
    ChevronRight
  } from 'lucide-svelte';
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let searchTerm = $state(data.filters.search);
  let selectedStatus = $state(data.filters.status);
  let selectedLanguage = $state(data.filters.language);
  let selectedLevel = $state(data.filters.level);

  const languages = [
    'YORUBA', 'IGBO', 'HAUSA', 'EFIK', 'TIV', 'FULFULDE', 
    'KANURI', 'IBIBIO', 'EDO', 'IJAW', 'PIDGIN'
  ];
  
  const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  function handleSearch() {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedStatus && selectedStatus !== 'ALL') params.set('status', selectedStatus);
    if (selectedLanguage && selectedLanguage !== 'ALL') params.set('language', selectedLanguage);
    if (selectedLevel && selectedLevel !== 'ALL') params.set('level', selectedLevel);
    params.set('page', '1');
    
    goto(`/admin/courses?${params.toString()}`);
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams($page.url.searchParams);
    params.set('page', newPage.toString());
    goto(`/admin/courses?${params.toString()}`);
  }

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  function exportCourses() {
    const headers = ['Title', 'Instructor', 'Language', 'Level', 'Status', 'Enrollments', 'Price', 'Created'];
    const csvData = data.courses.map(course => [
      course.title,
      course.createdBy.name,
      course.language,
      course.level,
      course.isPublished ? 'Published' : 'Draft',
      course._count.enrollments,
      course.price,
      formatDate(course.createdAt)
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'courses.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  let dropdownOpen: { [key: string]: boolean } = $state({});

  function toggleDropdown(courseId: string, event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    
    // Close all other dropdowns and toggle this one
    const newState: { [key: string]: boolean } = {};
    const isCurrentlyOpen = dropdownOpen[courseId] || false;
    newState[courseId] = !isCurrentlyOpen;
    dropdownOpen = newState;
  }

  // DISABLED: Click outside handler - causing modal issues
  // Will implement a better solution later
  /*
  $effect(() => {
    // CRITICAL: Do not add click listener if modal is open or opening
    if (showDeleteConfirm || isOpeningModal) {
      console.log('� Effect: Modal state active, NOT adding click listener');
      return;
    }
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Don't close if clicking inside a dropdown
      if (target.closest('.dropdown-menu')) {
        return;
      }
      
      // Don't close if clicking the more button
      if (target.closest('[data-dropdown-trigger]')) {
        return;
      }
      
      // Don't close if clicking something that opens the modal
      if (target.closest('[data-opens-modal]')) {
        return;
      }
      
      // Close all dropdowns
      if (Object.keys(dropdownOpen).some(key => dropdownOpen[key])) {
        console.log('✅ Click outside: Closing dropdowns');
        dropdownOpen = {};
      }
    };
    
    // Only add listener if we have open dropdowns
    const hasOpenDropdowns = Object.values(dropdownOpen).some(Boolean);
    if (hasOpenDropdowns) {
      console.log('✅ Effect: Adding click-outside listener');
      document.addEventListener('click', handleClickOutside);
      return () => {
        console.log('🧹 Effect: Removing click-outside listener');
        document.removeEventListener('click', handleClickOutside);
      };
    }
  });
  */

  
  // Close dropdown after form submission
  function handleFormSubmit(courseId: string) {
    return () => {
      dropdownOpen = {};
      return async ({ update, result }: any) => {
        await update();
        // Refresh page after successful deletion
        if (result.type === 'success') {
          window.location.reload();
        }
      };
    };
  }
</script>

<svelte:head>
  <title>Courses Management - Admin</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="border-b border-gray-200 pb-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Courses Management
        </h1>
        <p class="mt-1 text-sm text-gray-500">
          Manage all courses, approvals, and content moderation
        </p>
      </div>
      <div class="flex space-x-3">
        <button
          onclick={exportCourses}
          class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Download class="h-4 w-4 mr-2" />
          Export
        </button>
      </div>
    </div>
  </div>

  <!-- Stats Cards -->
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <BookOpen class="h-6 w-6 text-blue-400" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Total Courses</dt>
              <dd class="text-2xl font-semibold text-gray-900">{data.stats.total}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Globe class="h-6 w-6 text-green-400" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Published</dt>
              <dd class="text-2xl font-semibold text-gray-900">{data.stats.published}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <CheckCircle class="h-6 w-6 text-yellow-400" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Pending Approval</dt>
              <dd class="text-2xl font-semibold text-gray-900">{data.stats.pending}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Filters and Search -->
  <div class="bg-white shadow rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <!-- Search -->
        <div class="lg:col-span-2">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              bind:value={searchTerm}
              onkeydown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search courses, instructors..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <!-- Status Filter -->
        <div>
          <select
            bind:value={selectedStatus}
            onchange={handleSearch}
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="ALL">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending Approval</option>
          </select>
        </div>

        <!-- Language Filter -->
        <div>
          <select
            bind:value={selectedLanguage}
            onchange={handleSearch}
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="ALL">All Languages</option>
            {#each languages as language}
              <option value={language}>{language}</option>
            {/each}
          </select>
        </div>

        <!-- Level Filter -->
        <div>
          <select
            bind:value={selectedLevel}
            onchange={handleSearch}
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="ALL">All Levels</option>
            {#each levels as level}
              <option value={level}>{level}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>
  </div>

  <!-- Success/Error Messages -->
  {#if form?.success}
    <div class="rounded-md bg-green-50 p-4">
      <div class="text-sm text-green-800">{form.message}</div>
    </div>
  {/if}

  {#if form?.error}
    <div class="rounded-md bg-red-50 p-4">
      <div class="text-sm text-red-800">{form.error}</div>
    </div>
  {/if}

  <!-- Courses Table -->
  <div class="bg-white shadow rounded-lg">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        
        <tbody class="bg-white divide-y divide-gray-200 pb-4">
          {#each data.courses as course}
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {#if course.imageUrl}
                      <img class="h-12 w-12 object-cover" src={course.imageUrl} alt={course.title} />
                    {:else}
                      <div class="h-12 w-12 flex items-center justify-center">
                        <BookOpen class="h-6 w-6 text-gray-400" />
                      </div>
                    {/if}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 max-w-xs truncate">{course.title}</div>
                    <div class="text-sm text-gray-500">
                      {course.language} • {course.level}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{course.createdBy.name}</div>
                <div class="text-sm text-gray-500">{course.createdBy.email}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  <div class="flex items-center space-x-4">
                    <span class="flex items-center">
                      <BookOpen class="h-4 w-4 mr-1 text-gray-400" />
                      {course._count.lessons} lessons
                    </span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col space-y-1">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {course.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {course.isApproved ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}">
                    {course.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </td>
              
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(course.createdAt)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                <div class="relative inline-block text-left">
                  <button
                    data-dropdown-trigger="true"
                    onclick={(e) => toggleDropdown(course.id, e)}
                    class="flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <MoreHorizontal class="h-5 w-5" />
                  </button>

                  {#if dropdownOpen[course.id]}
                    <div class="relative">
                      <div 
                        class="dropdown-menu absolute right-0 mt-2 mb-4 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                        role="menu"
                        tabindex="-1"
                        onclick={(e) => e.stopPropagation()}
                        onkeydown={(e) => e.key === 'Escape' && (dropdownOpen = {})}
                      >
                      <div class="py-1">

                        <!-- Manage Lessons -->
                        <a
                          href="/admin/courses/{course.id}"
                          class="flex items-center px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                        >
                          <BookOpen class="h-4 w-4 mr-2" />
                          Manage Lessons
                        </a>

                        <!-- Toggle Publish -->
                        <form method="POST" action="?/togglePublish" use:enhance={handleFormSubmit(course.id)}>
                          <input type="hidden" name="courseId" value={course.id} />
                          <button
                            type="submit"
                            class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Globe class="h-4 w-4 mr-2" />
                            {course.isPublished ? 'Unpublish' : 'Publish'}
                          </button>
                        </form>

                        <!-- Approve/Reject -->
                        {#if !course.isApproved}
                          <form method="POST" action="?/approve" use:enhance={handleFormSubmit(course.id)}>
                            <input type="hidden" name="courseId" value={course.id} />
                            <button
                              type="submit"
                              class="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle class="h-4 w-4 mr-2" />
                              Approve Course
                            </button>
                          </form>
                        {/if}

                        <form method="POST" action="?/reject" use:enhance={handleFormSubmit(course.id)}>
                          <input type="hidden" name="courseId" value={course.id} />
                          <button
                            type="submit"
                            class="flex items-center w-full px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
                          >
                            <XCircle class="h-4 w-4 mr-2" />
                            Reject Course
                          </button>
                        </form>

                        <!-- Delete -->
                        <form 
                          method="POST" 
                          action="?/delete" 
                          use:enhance={handleFormSubmit(course.id)}
                        >
                          <input type="hidden" name="courseId" value={course.id} />
                          <button
                            type="submit"
                            class="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                          >
                            <Trash2 class="h-4 w-4 mr-2" />
                            Delete Course
                          </button>
                        </form>
                      </div>
                    </div>
                    </div>
                  {/if}
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    {#if data.pagination.totalPages > 1}
      <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          {#if data.pagination.hasPrev}
            <button
              onclick={() => handlePageChange(data.pagination.page - 1)}
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
          {/if}
          {#if data.pagination.hasNext}
            <button
              onclick={() => handlePageChange(data.pagination.page + 1)}
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          {/if}
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing
              <span class="font-medium">{(data.pagination.page - 1) * data.pagination.limit + 1}</span>
              to
              <span class="font-medium">{Math.min(data.pagination.page * data.pagination.limit, data.pagination.totalCount)}</span>
              of
              <span class="font-medium">{data.pagination.totalCount}</span>
              results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              {#if data.pagination.hasPrev}
                <button
                  onclick={() => handlePageChange(data.pagination.page - 1)}
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <ChevronLeft class="h-5 w-5" />
                </button>
              {/if}
              
              <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              
              {#if data.pagination.hasNext}
                <button
                  onclick={() => handlePageChange(data.pagination.page + 1)}
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <ChevronRight class="h-5 w-5" />
                </button>
              {/if}
            </nav>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

