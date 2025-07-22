<script lang="ts">
  import { 
    Users, 
    BookOpen, 
    TrendingUp, 
    DollarSign, 
    GraduationCap,
    Award,
    FileText,
    Calendar,
    BarChart3,
    ArrowUp,
    ArrowDown
  } from 'lucide-svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  function formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  }
</script>

<svelte:head>
  <title>Admin Dashboard - NaijaLingua</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="border-b border-gray-200 pb-5">
    <h1 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
      Admin Dashboard
    </h1>
    <p class="mt-1 text-sm text-gray-500">
      Overview of your platform's performance and key metrics
    </p>
  </div>

  <!-- Stats Grid -->
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
    <!-- Total Users -->
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Users class="h-6 w-6 text-gray-400" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Total Users</dt>
              <dd class="flex items-baseline">
                <div class="text-2xl font-semibold text-gray-900">
                  {formatNumber(data.stats.users.total)}
                </div>
                <div class="ml-2 flex items-baseline text-sm font-semibold {data.stats.users.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}">
                  {#if data.stats.users.growthRate >= 0}
                    <ArrowUp class="self-center flex-shrink-0 h-4 w-4" />
                  {:else}
                    <ArrowDown class="self-center flex-shrink-0 h-4 w-4" />
                  {/if}
                  <span class="sr-only">{data.stats.users.growthRate >= 0 ? 'Increased' : 'Decreased'} by</span>
                  {Math.abs(data.stats.users.growthRate)}%
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 px-5 py-3">
        <div class="text-sm">
          <span class="font-medium text-gray-900">{data.stats.users.instructors}</span>
          <span class="text-gray-500"> instructors, </span>
          <span class="font-medium text-gray-900">{data.stats.users.students}</span>
          <span class="text-gray-500"> students</span>
        </div>
      </div>
    </div>

    <!-- Total Courses -->
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <BookOpen class="h-6 w-6 text-blue-400" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Total Courses</dt>
              <dd class="flex items-baseline">
                <div class="text-2xl font-semibold text-gray-900">
                  {formatNumber(data.stats.courses.total)}
                </div>
                <div class="ml-2 flex items-baseline text-sm font-semibold {data.stats.courses.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}">
                  {#if data.stats.courses.growthRate >= 0}
                    <ArrowUp class="self-center flex-shrink-0 h-4 w-4" />
                  {:else}
                    <ArrowDown class="self-center flex-shrink-0 h-4 w-4" />
                  {/if}
                  {Math.abs(data.stats.courses.growthRate)}%
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 px-5 py-3">
        <div class="text-sm">
          <span class="font-medium text-green-600">{data.stats.courses.published}</span>
          <span class="text-gray-500"> published, </span>
          <span class="font-medium text-yellow-600">{data.stats.courses.draft}</span>
          <span class="text-gray-500"> draft</span>
        </div>
      </div>
    </div>

    <!-- Total Enrollments -->
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <GraduationCap class="h-6 w-6 text-green-400" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Total Enrollments</dt>
              <dd class="flex items-baseline">
                <div class="text-2xl font-semibold text-gray-900">
                  {formatNumber(data.stats.enrollments.total)}
                </div>
                <div class="ml-2 flex items-baseline text-sm font-semibold {data.stats.enrollments.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}">
                  {#if data.stats.enrollments.growthRate >= 0}
                    <ArrowUp class="self-center flex-shrink-0 h-4 w-4" />
                  {:else}
                    <ArrowDown class="self-center flex-shrink-0 h-4 w-4" />
                  {/if}
                  {Math.abs(data.stats.enrollments.growthRate)}%
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 px-5 py-3">
        <div class="text-sm">
          <span class="font-medium text-green-600">{data.stats.enrollments.completed}</span>
          <span class="text-gray-500"> completed</span>
          <span class="text-gray-500"> ({data.stats.enrollments.completionRate.toFixed(1)}% completion rate)</span>
        </div>
      </div>
    </div>

    <!-- Revenue -->
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <DollarSign class="h-6 w-6 text-green-500" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
              <dd class="flex items-baseline">
                <div class="text-2xl font-semibold text-gray-900">
                  {formatCurrency(data.stats.revenue.total)}
                </div>
                <div class="ml-2 flex items-baseline text-sm font-semibold {data.stats.revenue.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}">
                  {#if data.stats.revenue.growthRate >= 0}
                    <ArrowUp class="self-center flex-shrink-0 h-4 w-4" />
                  {:else}
                    <ArrowDown class="self-center flex-shrink-0 h-4 w-4" />
                  {/if}
                  {Math.abs(data.stats.revenue.growthRate)}%
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 px-5 py-3">
        <div class="text-sm">
          <span class="text-gray-500">This month</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Content Stats -->
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <FileText class="h-6 w-6 text-indigo-400" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Total Lessons</dt>
              <dd class="text-2xl font-semibold text-gray-900">
                {formatNumber(data.stats.content.lessons)}
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
            <Award class="h-6 w-6 text-purple-400" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Total Quizzes</dt>
              <dd class="text-2xl font-semibold text-gray-900">
                {formatNumber(data.stats.content.quizzes)}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Recent Activity Grid -->
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <!-- Recent Users -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Users</h3>
        <div class="flow-root">
          <ul role="list" class="-my-5 divide-y divide-gray-200">
            {#each data.recent.users as user}
              <li class="py-4">
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span class="text-xs font-medium text-gray-600">{user.name[0]}</span>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <p class="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                  <div class="flex-shrink-0">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {user.role === 'INSTRUCTOR' ? 'bg-blue-100 text-blue-800' : user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                      {user.role.toLowerCase()}
                    </span>
                  </div>
                </div>
              </li>
            {/each}
          </ul>
        </div>
        <div class="mt-6">
          <a href="/admin/users" class="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            View all users
          </a>
        </div>
      </div>
    </div>

    <!-- Recent Courses -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Courses</h3>
        <div class="flow-root">
          <ul role="list" class="-my-5 divide-y divide-gray-200">
            {#each data.recent.courses as course}
              <li class="py-4">
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    {#if course.imageUrl}
                      <img class="h-10 w-10 rounded-lg object-cover" src={course.imageUrl} alt={course.title} />
                    {:else}
                      <div class="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                        <BookOpen class="h-5 w-5 text-gray-400" />
                      </div>
                    {/if}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{course.title}</p>
                    <p class="text-sm text-gray-500 truncate">by {course.createdBy.name}</p>
                  </div>
                  <div class="flex-shrink-0">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {course.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              </li>
            {/each}
          </ul>
        </div>
        <div class="mt-6">
          <a href="/admin/courses" class="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            View all courses
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- Recent Enrollments -->
  <div class="bg-white shadow rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Enrollments</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each data.recent.enrollments as enrollment}
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span class="text-xs font-medium text-gray-600">{enrollment.user.name[0]}</span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{enrollment.user.name}</div>
                      <div class="text-sm text-gray-500">{enrollment.user.email}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{enrollment.course.title}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div class="bg-blue-500 h-2 rounded-full" style="width: {enrollment.progress}%"></div>
                    </div>
                    <span class="text-sm text-gray-600">{Math.round(enrollment.progress)}%</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {enrollment.isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
                    {enrollment.isCompleted ? 'Completed' : 'Active'}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(enrollment.startedAt)}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <div class="mt-6">
        <a href="/admin/enrollments" class="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          View all enrollments
        </a>
      </div>
    </div>
  </div>

  <!-- Quick Actions -->
  <div class="bg-white shadow rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <a href="/admin/users" class="flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          <Users class="h-4 w-4 mr-2" />
          Manage Users
        </a>
        <a href="/admin/courses" class="flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          <BookOpen class="h-4 w-4 mr-2" />
          Manage Courses
        </a>
        <a href="/admin/analytics" class="flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          <BarChart3 class="h-4 w-4 mr-2" />
          View Analytics
        </a>
        <a href="/admin/reports" class="flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          <FileText class="h-4 w-4 mr-2" />
          Generate Reports
        </a>
      </div>
    </div>
  </div>
</div>
