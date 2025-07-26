<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { 
    Users, 
    BookOpen, 
    Settings, 
    BarChart3, 
    Shield, 
    Menu, 
    X,
    Home,
    GraduationCap,
    FileText,
    Award,
    DollarSign,
    UserCheck
  } from 'lucide-svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  let sidebarOpen = false;

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  function closeSidebar() {
    sidebarOpen = false;
  }

  onMount(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        sidebarOpen = false;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  $: currentPath = $page.url.pathname;
</script>

<svelte:head>
  <title>Admin Dashboard - {data.user.name}</title>
</svelte:head>

<div class="flex h-screen bg-gray-100">
  <!-- Sidebar -->
  <div class="hidden lg:flex lg:flex-shrink-0">
    <div class="flex flex-col w-64">
      <div class="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
        <div class="flex items-center flex-shrink-0 px-4">
          <Shield class="w-8 h-8 text-red-600" />
          <span class="ml-2 text-xl font-bold text-gray-900">Admin Panel</span>
        </div>
        
        <div class="mt-5 flex-grow flex flex-col">
          <nav class="flex-1 px-2 space-y-1">
            <!-- Dashboard -->
            <a 
              href="/admin" 
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md {currentPath === '/admin' ? 'bg-red-100 text-red-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
            >
              <Home class="mr-3 w-5 h-5 {currentPath === '/admin' ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'}" />
              Dashboard
            </a>

            <!-- Users Management -->
            <a 
              href="/admin/users" 
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md {currentPath.startsWith('/admin/users') ? 'bg-red-100 text-red-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
            >
              <Users class="mr-3 w-5 h-5 {currentPath.startsWith('/admin/users') ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'}" />
              Users
            </a>

            <!-- Instructors Management -->
            <a 
              href="/admin/instructors" 
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md {currentPath.startsWith('/admin/instructors') ? 'bg-red-100 text-red-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
            >
              <GraduationCap class="mr-3 w-5 h-5 {currentPath.startsWith('/admin/instructors') ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'}" />
              Instructors
            </a>

            <!-- Courses Management -->
            <a 
              href="/admin/courses" 
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md {currentPath.startsWith('/admin/courses') ? 'bg-red-100 text-red-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
            >
              <BookOpen class="mr-3 w-5 h-5 {currentPath.startsWith('/admin/courses') ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'}" />
              Courses
            </a>

            <!-- Content Generation -->
            <a 
              href="/admin/content-generation" 
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md {currentPath.startsWith('/admin/content-generation') ? 'bg-red-100 text-red-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
            >
              <FileText class="mr-3 w-5 h-5 {currentPath.startsWith('/admin/content-generation') ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'}" />
              Content Generation
            </a>

            <!-- Enrollments -->
            <a 
              href="/admin/enrollments" 
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md {currentPath.startsWith('/admin/enrollments') ? 'bg-red-100 text-red-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
            >
              <UserCheck class="mr-3 w-5 h-5 {currentPath.startsWith('/admin/enrollments') ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'}" />
              Enrollments
            </a>

            <!-- Certificates -->
            <a 
              href="/admin/certificates" 
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md {currentPath.startsWith('/admin/certificates') ? 'bg-red-100 text-red-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
            >
              <Award class="mr-3 w-5 h-5 {currentPath.startsWith('/admin/certificates') ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'}" />
              Certificates
            </a>

            <!-- Analytics -->
            <a 
              href="/admin/analytics" 
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md {currentPath.startsWith('/admin/analytics') ? 'bg-red-100 text-red-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
            >
              <BarChart3 class="mr-3 w-5 h-5 {currentPath.startsWith('/admin/analytics') ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'}" />
              Analytics
            </a>

            <!-- Financial Reports -->
            <a 
              href="/admin/financial" 
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md {currentPath.startsWith('/admin/financial') ? 'bg-red-100 text-red-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
            >
              <DollarSign class="mr-3 w-5 h-5 {currentPath.startsWith('/admin/financial') ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'}" />
              Financial
            </a>

            <!-- Reports -->
            <a 
              href="/admin/reports" 
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md {currentPath.startsWith('/admin/reports') ? 'bg-red-100 text-red-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
            >
              <FileText class="mr-3 w-5 h-5 {currentPath.startsWith('/admin/reports') ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'}" />
              Reports
            </a>

            <!-- Settings -->
            <a 
              href="/admin/settings" 
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md {currentPath.startsWith('/admin/settings') ? 'bg-red-100 text-red-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
            >
              <Settings class="mr-3 w-5 h-5 {currentPath.startsWith('/admin/settings') ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'}" />
              Settings
            </a>
          </nav>
        </div>

        <div class="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div class="flex-shrink-0 w-full group block">
            <div class="flex items-center">
              <div class="h-9 w-9 rounded-full bg-red-500 flex items-center justify-center">
                <span class="text-sm font-medium text-white">{data.user.name[0]}</span>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-700">{data.user.name}</p>
                <p class="text-xs font-medium text-gray-500">Admin</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile sidebar -->
  {#if sidebarOpen}
    <div class="fixed inset-0 z-40 lg:hidden">
      <div class="fixed inset-0 bg-gray-600 bg-opacity-75" role="button" tabindex="0" on:click={toggleSidebar} on:keydown={(e) => e.key === 'Enter' && toggleSidebar()}></div>
      <div class="relative flex-1 flex flex-col max-w-xs w-full bg-white">
        <div class="absolute top-0 right-0 -mr-12 pt-2">
          <button class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" on:click={toggleSidebar}>
            <X class="h-6 w-6 text-white" />
          </button>
        </div>
        <div class="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
          <div class="flex-shrink-0 flex items-center px-4">
            <Shield class="w-8 h-8 text-red-600" />
            <span class="ml-2 text-xl font-bold text-gray-900">Admin Panel</span>
          </div>
          <nav class="mt-5 px-2 space-y-1">
            <a href="/admin" class="group flex items-center px-2 py-2 text-base font-medium rounded-md {currentPath === '/admin' ? 'bg-red-100 text-red-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}" on:click={closeSidebar}>
              <Home class="mr-4 w-6 h-6 {currentPath === '/admin' ? 'text-red-500' : 'text-gray-400'}" />
              Dashboard
            </a>
            <!-- Add other mobile nav items here -->
          </nav>
        </div>
      </div>
    </div>
  {/if}

  <!-- Main content -->
  <div class="flex flex-col w-0 flex-1 overflow-hidden">
    <!-- Top bar -->
    <div class="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
      <button class="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500 lg:hidden" on:click={toggleSidebar}>
        <Menu class="h-6 w-6" />
      </button>
      <div class="flex-1 px-4 flex justify-between">
        <div class="flex-1 flex">
          <div class="w-full flex md:ml-0">
            <div class="relative w-full text-gray-400 focus-within:text-gray-600">
              <div class="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                <!-- Search icon or other content -->
              </div>
            </div>
          </div>
        </div>
        <div class="ml-4 flex items-center md:ml-6">
          <span class="text-sm font-medium text-gray-700">Welcome, {data.user.name}</span>
        </div>
      </div>
    </div>

    <!-- Page content -->
    <main class="flex-1 relative overflow-y-auto focus:outline-none">
      <div class="py-6">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <slot />
        </div>
      </div>
    </main>
  </div>
</div>
