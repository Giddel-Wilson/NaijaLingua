<script lang="ts">
  import { 
    Search, 
    Filter, 
    MoreHorizontal, 
    UserCheck, 
    UserX, 
    Shield, 
    AlertTriangle,
    Download,
    Plus,
    ChevronLeft,
    ChevronRight,
    X
  } from 'lucide-svelte';
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onDestroy } from 'svelte';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  // Fallback data for testing when database is unavailable
  const fallbackUsers = data.users.length === 0 ? [
    {
      id: 'test-1',
      name: 'Dr. Adebayo Johnson',
      email: 'instructor@naijalingua.com',
      role: 'TUTOR',
      suspended: false,
      banned: false,
      profileImage: null,
      createdAt: new Date('2025-09-04'),
      _count: { courses: 4, enrollments: 0, certificates: 0 }
    },
    {
      id: 'test-2', 
      name: 'Demo Student',
      email: 'student@naijalingua.com',
      role: 'STUDENT',
      suspended: false,
      banned: false,
      profileImage: null,
      createdAt: new Date('2025-08-29'),
      _count: { courses: 0, enrollments: 3, certificates: 1 }
    },
    {
      id: 'test-3',
      name: 'John Smith',
      email: 'john.smith@example.com',
      role: 'STUDENT',
      suspended: true,
      banned: false,
      profileImage: null,
      createdAt: new Date('2025-08-15'),
      _count: { courses: 0, enrollments: 1, certificates: 0 }
    },
    {
      id: 'test-4',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      role: 'TUTOR',
      suspended: false,
      banned: false,
      profileImage: null,
      createdAt: new Date('2025-07-20'),
      _count: { courses: 2, enrollments: 0, certificates: 0 }
    },
    {
      id: 'test-5',
      name: 'Mike Brown',
      email: 'mike.brown@test.com',
      role: 'STUDENT',
      suspended: false,
      banned: true,
      profileImage: null,
      createdAt: new Date('2025-06-10'),
      _count: { courses: 0, enrollments: 0, certificates: 0 }
    }
  ] : data.users;

  let searchTerm = $state(data.filters.search);
  let selectedRole = $state(data.filters.role);
  let selectedStatus = $state(data.filters.status);
  let showFilters = $state(false);
  let searchTimeout: NodeJS.Timeout;

  // Simple function to filter users
  function getFilteredUsers() {
    let users = fallbackUsers;

    // Apply search filter
    if (searchTerm) {
      users = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (selectedRole && selectedRole !== 'ALL') {
      users = users.filter(user => user.role === selectedRole);
    }

    // Apply status filter
    if (selectedStatus && selectedStatus !== 'ALL') {
      if (selectedStatus === 'SUSPENDED') {
        users = users.filter(user => user.suspended);
      } else if (selectedStatus === 'BANNED') {
        users = users.filter(user => user.banned);
      } else if (selectedStatus === 'ACTIVE') {
        users = users.filter(user => !user.suspended && !user.banned);
      }
    }

    return users;
  }

  // Get filtered users (will be reactive) - using proper Svelte 5 syntax
  let filteredUsers = $derived(getFilteredUsers());

  function handleSearch() {
    // For real database data, use server-side filtering
    if (data.users.length > 0) {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (selectedRole && selectedRole !== 'ALL') params.set('role', selectedRole);
      if (selectedStatus && selectedStatus !== 'ALL') params.set('status', selectedStatus);
      params.set('page', '1');
      
      goto(`/admin/users?${params.toString()}`);
    }
    // For fallback data, client-side filtering is handled by the $derived above
  }

  function handleSearchInput() {
    // For fallback data, no need for debouncing since it's client-side
    if (data.users.length === 0) {
      return; // Client-side filtering is reactive via $derived
    }
    
    // For real database data, use debounced server-side search
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounced search
    searchTimeout = setTimeout(() => {
      handleSearch();
    }, 300); // 300ms delay
  }

  function clearFilters() {
    searchTerm = '';
    selectedRole = 'ALL';
    selectedStatus = 'ALL';
    goto('/admin/users');
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams($page.url.searchParams);
    params.set('page', newPage.toString());
    goto(`/admin/users?${params.toString()}`);
  }

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  }

  function exportUsers() {
    // Create CSV data
    const headers = ['Name', 'Email', 'Role', 'Status', 'Courses', 'Enrollments', 'Certificates', 'Created'];
    const csvData = filteredUsers.map(user => [
      user.name,
      user.email,
      user.role,
      user.banned ? 'Banned' : user.suspended ? 'Suspended' : 'Active',
      user._count.courses,
      user._count.enrollments,
      user._count.certificates,
      formatDate(user.createdAt)
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  let dropdownOpen = $state('');

  function toggleDropdown(userId: string, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    // Toggle: if this dropdown is open, close it; otherwise open it
    if (dropdownOpen === userId) {
      dropdownOpen = '';
    } else {
      dropdownOpen = userId;
    }
  }

  function closeDropdown(userId: string) {
    dropdownOpen = '';
  }

  function closeAllDropdowns(event?: Event) {
    // Don't close if clicking inside a dropdown
    if (event && event.target) {
      const target = event.target as Element;
      if (target.closest('.dropdown-menu')) {
        return;
      }
    }
    dropdownOpen = '';
  }

  // Cleanup timeout on component destroy
  onDestroy(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
  });
</script>

<svelte:window onclick={closeAllDropdowns} />

<svelte:head>
  <title>Users Management - Admin</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="border-b border-gray-200 pb-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Users Management
        </h1>
        <p class="mt-1 text-sm text-gray-500">
          Manage all platform users, roles, and permissions
        </p>
      </div>
      <div class="flex space-x-3">
        <button
          onclick={exportUsers}
          class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Download class="h-4 w-4 mr-2" />
          Export
        </button>
      </div>
    </div>
  </div>

  <!-- Filters and Search -->
  <div class="bg-white shadow rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <div class="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <!-- Search -->
        <div class="flex-1">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              bind:value={searchTerm}
              oninput={handleSearchInput}
              onkeydown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search users by name or email..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <!-- Role Filter -->
        <div class="flex-shrink-0">
          <select
            bind:value={selectedRole}
            onchange={handleSearch}
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="TUTOR">Tutors</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>

        <!-- Status Filter -->
        <div class="flex-shrink-0">
          <select
            bind:value={selectedStatus}
            onchange={handleSearch}
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="BANNED">Banned</option>
          </select>
        </div>

        <button
          onclick={clearFilters}
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <X class="h-4 w-4 mr-2" />
          Clear Filters
        </button>
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

  <!-- Users Table -->
  <div class="bg-white shadow rounded-lg">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each filteredUsers as user}
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {#if user.profileImage}
                      <img class="h-10 w-10 rounded-full" src={user.profileImage} alt={user.name} />
                    {:else}
                      <span class="text-sm font-medium text-gray-600">{user.name[0]}</span>
                    {/if}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{user.name}</div>
                    <div class="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : user.role === 'TUTOR' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}">
                  {user.role.toLowerCase()}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {#if user.banned}
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <AlertTriangle class="h-3 w-3 mr-1" />
                    Banned
                  </span>
                {:else if user.suspended}
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <AlertTriangle class="h-3 w-3 mr-1" />
                    Suspended
                  </span>
                {:else}
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <UserCheck class="h-3 w-3 mr-1" />
                    Active
                  </span>
                {/if}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex space-x-4">
                  <span>Courses: {user._count.courses}</span>
                  <span>Enrollments: {user._count.enrollments}</span>
                  <span>Certificates: {user._count.certificates}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(user.createdAt)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                {#if user.email === 'admin@naijalingua.com' || user.name === 'System Administrator'}
                  <!-- System Administrator cannot be edited -->
                  <span class="text-gray-400 text-xs">Protected Account</span>
                {:else}
                  <div class="relative inline-block text-left">
                    <button
                      onclick={(e) => {
                        toggleDropdown(user.id, e);
                      }}
                      class="flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      <MoreHorizontal class="h-5 w-5" />
                    </button>

                    {#if dropdownOpen === user.id}
                      <div class="relative">
                        <div 
                          class="dropdown-menu absolute right-0 mt-2 mb-4 px-1 w-52 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                          onclick={(e) => e.stopPropagation()}
                          onkeydown={(e) => e.key === 'Escape' && closeDropdown(user.id)}
                          role="menu"
                          tabindex="0"
                        >
                      <div class="py-1 pb-4">
                        <!-- Role Change -->
                        <form method="POST" action="?/changeRole" use:enhance>
                          <input type="hidden" name="userId" value={user.id} />
                          <select
                            name="role"
                            onchange={(e) => {
                              const form = (e.target as HTMLSelectElement).closest('form');
                              if (form) form.submit();
                            }}
                            class="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-none focus:outline-none"
                          >
                            <option value={user.role} selected disabled>Change Role ({user.role})</option>
                            {#if user.role !== 'STUDENT'}
                              <option value="STUDENT">Make Student</option>
                            {/if}
                            {#if user.role !== 'TUTOR'}
                              <option value="TUTOR">Make Tutor</option>
                            {/if}
                            {#if user.role !== 'ADMIN'}
                              <option value="ADMIN">Make Admin</option>
                            {/if}
                          </select>
                        </form>

                        <!-- Status Actions -->
                        {#if !user.banned}
                          {#if user.suspended}
                            <form method="POST" action="?/unsuspend" use:enhance>
                              <input type="hidden" name="userId" value={user.id} />
                              <button
                                type="submit"
                                class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <UserCheck class="h-4 w-4 mr-2" />
                                Unsuspend User
                              </button>
                            </form>
                          {:else}
                            <form method="POST" action="?/suspend" use:enhance>
                              <input type="hidden" name="userId" value={user.id} />
                              <button
                                type="submit"
                                class="flex items-center w-full px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
                              >
                                <UserX class="h-4 w-4 mr-2" />
                                Suspend User
                              </button>
                            </form>
                          {/if}

                          <form method="POST" action="?/ban" use:enhance>
                            <input type="hidden" name="userId" value={user.id} />
                            <button
                              type="submit"
                              class="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                            >
                              <AlertTriangle class="h-4 w-4 mr-2" />
                              Ban User
                            </button>
                          </form>
                        {:else}
                          <form method="POST" action="?/unban" use:enhance>
                            <input type="hidden" name="userId" value={user.id} />
                            <button
                              type="submit"
                              class="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                            >
                              <UserCheck class="h-4 w-4 mr-2" />
                              Unban User
                            </button>
                          </form>
                        {/if}
                      </div>
                    </div>
                    </div>
                  {/if}
                  </div>
                {/if}
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
