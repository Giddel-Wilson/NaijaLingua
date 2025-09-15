<script lang="ts">
  import { enhance } from '$app/forms';
  import { 
    FileText, 
    Download, 
    Users, 
    BookOpen, 
    Target,
    TrendingUp,
    Calendar,
    BarChart3,
    PieChart,
    Activity,
    Award,
    Settings
  } from 'lucide-svelte';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let selectedReportType = 'users';
  let selectedFormat = 'csv';
  let isExporting = false;

  const reportTypes = [
    { id: 'users', name: 'User Reports', icon: Users, description: 'User registrations, roles, and activity' },
    { id: 'courses', name: 'Course Reports', icon: BookOpen, description: 'Course creation, languages, and levels' },
    { id: 'enrollments', name: 'Enrollment Reports', icon: Target, description: 'Student enrollments and completion rates' },
    { id: 'performance', name: 'Performance Reports', icon: TrendingUp, description: 'Instructor and course performance metrics' }
  ];

  const exportFormats = [
    { id: 'csv', name: 'CSV', description: 'Comma-separated values' },
    { id: 'excel', name: 'Excel', description: 'Microsoft Excel format' },
    { id: 'pdf', name: 'PDF', description: 'Portable document format' }
  ];
</script>

<svelte:head>
  <title>Reports - Admin Panel</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 flex items-center">
        <FileText class="mr-3 h-6 w-6 text-indigo-600" />
        Reports & Analytics
      </h1>
      <p class="mt-1 text-sm text-gray-600">
        Generate and export detailed reports about platform performance
      </p>
    </div>
  </div>

  <!-- Action Messages -->
  {#if form?.success}
    <div class="rounded-md bg-green-50 p-4">
      <div class="flex">
        <div class="ml-3">
          <p class="text-sm font-medium text-green-800">
            {form.message}
          </p>
          {#if form.downloadUrl}
            <a href={form.downloadUrl} class="text-sm font-medium text-green-600 hover:text-green-500">
              Download Report →
            </a>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  {#if form?.error}
    <div class="rounded-md bg-red-50 p-4">
      <div class="flex">
        <div class="ml-3">
          <p class="text-sm font-medium text-red-800">
            {form.error}
          </p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Report Export Section -->
  <div class="bg-white shadow rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
        Export Reports
      </h3>
      
      <form 
        method="POST" 
        action="?/exportReport"
        use:enhance={() => {
          isExporting = true;
          return async ({ update }) => {
            isExporting = false;
            await update();
          };
        }}
      >
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label class="text-base font-medium text-gray-900">Report Type</label>
            <p class="text-sm leading-5 text-gray-500">Select the type of report to generate</p>
            <fieldset class="mt-4">
              <div class="space-y-4">
                {#each reportTypes as reportType}
                  <div class="flex items-center">
                    <input
                      id={reportType.id}
                      name="reportType"
                      type="radio"
                      bind:group={selectedReportType}
                      value={reportType.id}
                      class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <label for={reportType.id} class="ml-3 block text-sm font-medium text-gray-700">
                      <div class="flex items-center">
                        <svelte:component this={reportType.icon} class="h-4 w-4 mr-2" />
                        {reportType.name}
                      </div>
                      <p class="text-xs text-gray-500">{reportType.description}</p>
                    </label>
                  </div>
                {/each}
              </div>
            </fieldset>
          </div>

          <div>
            <label class="text-base font-medium text-gray-900">Export Format</label>
            <p class="text-sm leading-5 text-gray-500">Choose the format for your report</p>
            <fieldset class="mt-4">
              <div class="space-y-4">
                {#each exportFormats as format}
                  <div class="flex items-center">
                    <input
                      id={format.id}
                      name="format"
                      type="radio"
                      bind:group={selectedFormat}
                      value={format.id}
                      class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <label for={format.id} class="ml-3 block text-sm font-medium text-gray-700">
                      {format.name}
                      <p class="text-xs text-gray-500">{format.description}</p>
                    </label>
                  </div>
                {/each}
              </div>
            </fieldset>
          </div>
        </div>

        <div class="mt-6">
          <button 
            type="submit" 
            disabled={isExporting}
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {#if isExporting}
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            {:else}
              <Download class="mr-2 h-4 w-4" />
              Generate Report
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Quick Stats Overview -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <!-- User Stats -->
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Users class="h-6 w-6 text-blue-600" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">
                Total Users
              </dt>
              <dd class="text-lg font-medium text-gray-900">
                {data.userReports.stats.total}
              </dd>
              <dd class="text-xs text-gray-500">
                {data.userReports.stats.active} active, {data.userReports.stats.suspended} suspended
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Course Stats -->
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <BookOpen class="h-6 w-6 text-green-600" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">
                Total Courses
              </dt>
              <dd class="text-lg font-medium text-gray-900">
                {data.courseReports.stats.total}
              </dd>
              <dd class="text-xs text-gray-500">
                {data.courseReports.stats.published} published, {data.courseReports.stats.draft} draft
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Enrollment Stats -->
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Target class="h-6 w-6 text-purple-600" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">
                Total Enrollments
              </dt>
              <dd class="text-lg font-medium text-gray-900">
                {data.enrollmentReports.stats.total}
              </dd>
              <dd class="text-xs text-gray-500">
                {data.enrollmentReports.stats.completionRate.toFixed(1)}% completion rate
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance -->
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Award class="h-6 w-6 text-orange-600" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">
                Active Instructors
              </dt>
              <dd class="text-lg font-medium text-gray-900">
                {data.userReports.stats.instructors}
              </dd>
              <dd class="text-xs text-gray-500">
                Creating quality content
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Top Performing Courses -->
  <div class="bg-white shadow rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
        <TrendingUp class="mr-2 h-5 w-5" />
        Top Performing Courses
      </h3>
      
      {#if data.performanceReports.courses.length > 0}
        <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table class="min-w-full divide-y divide-gray-300">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Language
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollments
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lessons
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each data.performanceReports.courses.slice(0, 10) as course}
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {course.title}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.language}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.level}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course._count.enrollments}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course._count.lessons}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {course.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <div class="text-center py-8">
          <BookOpen class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-xl font-medium text-gray-500 tracking-wider">COMING SOON</h3>
          <p class="mt-1 text-sm text-gray-500">
            Course performance metrics will appear here as data becomes available.
          </p>
        </div>
      {/if}
    </div>
  </div>

  <!-- Enrollment Trends -->
  {#if data.enrollmentReports.byMonth.length > 0}
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
          <Calendar class="mr-2 h-5 w-5" />
          Enrollment Trends (Last 6 Months)
        </h3>
        
        <div class="space-y-4">
          {#each data.enrollmentReports.byMonth as monthData}
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">{monthData.month}</span>
              <span class="text-sm text-gray-500">{monthData.count} enrollments</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-purple-600 h-2 rounded-full" 
                style="width: {Math.max((monthData.count / Math.max(...data.enrollmentReports.byMonth.map(m => m.count))) * 100, 2)}%"
              ></div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>
