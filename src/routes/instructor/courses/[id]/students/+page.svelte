<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Users, Award, TrendingUp, BookOpen, Mail, Calendar, Search, Filter, Download } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let searchQuery = '';
	let filterStatus = 'all'; // all, active, completed, not-started
	let sortBy = 'recent'; // recent, name, progress, score

	let filteredStudents = $derived(data.students
		.filter(student => {
			// Search filter
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				if (!student.user.name.toLowerCase().includes(query) && 
					!student.user.email.toLowerCase().includes(query)) {
					return false;
				}
			}
			
			// Status filter
			if (filterStatus === 'active' && student.progress === 0) return false;
			if (filterStatus === 'completed' && !student.isCompleted) return false;
			if (filterStatus === 'not-started' && student.progress > 0) return false;
			
			return true;
		})
		.sort((a, b) => {
			switch (sortBy) {
				case 'name':
					return a.user.name.localeCompare(b.user.name);
				case 'progress':
					return b.progressPercentage - a.progressPercentage;
				case 'score':
					return b.averageScore - a.averageScore;
				case 'recent':
				default:
					return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
			}
		}));

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function getStatusColor(student: any): string {
		if (student.isCompleted) return 'text-green-600 bg-green-100';
		if (student.progress > 0) return 'text-blue-600 bg-blue-100';
		return 'text-gray-600 bg-gray-100';
	}

	function getStatusText(student: any): string {
		if (student.isCompleted) return 'Completed';
		if (student.progress > 0) return 'In Progress';
		return 'Not Started';
	}

	function exportStudentData() {
		const csvContent = [
			['Name', 'Email', 'Enrolled Date', 'Status', 'Progress %', 'Lessons Completed', 'Average Score', 'Completion Date'].join(','),
			...filteredStudents.map(student => [
				student.user.name,
				student.user.email,
				formatDate(student.startedAt),
				getStatusText(student),
				student.progressPercentage,
				student.lessonsCompleted,
				student.averageScore,
				student.completedAt ? formatDate(student.completedAt) : 'N/A'
			].join(','))
		].join('\n');

		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${data.course.title}_students.csv`;
		a.click();
		window.URL.revokeObjectURL(url);
	}
</script>

<svelte:head>
	<title>Student Management - {data.course.title} | NaijaLingua</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Header -->
	<div class="flex justify-between items-start mb-8">
		<div>
			<nav class="flex items-center space-x-2 text-sm text-gray-500 mb-2">
				<a href="/instructor/courses" class="hover:text-gray-700">Courses</a>
				<span>/</span>
				<a href="/instructor/courses/{data.course.id}" class="hover:text-gray-700">{data.course.title}</a>
				<span>/</span>
				<span class="text-gray-900">Students</span>
			</nav>
			<h1 class="text-3xl font-bold text-gray-900">Student Management</h1>
			<p class="text-gray-600 mt-2">Monitor student progress and engagement for "{data.course.title}"</p>
		</div>
		<button
			on:click={exportStudentData}
			class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
		>
			<Download class="w-4 h-4 mr-2" />
			Export CSV
		</button>
	</div>

	<!-- Stats Overview -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<Users class="h-8 w-8 text-indigo-600" />
				</div>
				<div class="ml-4">
					<div class="text-2xl font-bold text-gray-900">{data.stats.totalStudents}</div>
					<div class="text-sm text-gray-500">Total Students</div>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<BookOpen class="h-8 w-8 text-blue-600" />
				</div>
				<div class="ml-4">
					<div class="text-2xl font-bold text-gray-900">{data.stats.activeStudents}</div>
					<div class="text-sm text-gray-500">Active Students</div>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<Award class="h-8 w-8 text-green-600" />
				</div>
				<div class="ml-4">
					<div class="text-2xl font-bold text-gray-900">{data.stats.completedStudents}</div>
					<div class="text-sm text-gray-500">Completed</div>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<TrendingUp class="h-8 w-8 text-purple-600" />
				</div>
				<div class="ml-4">
					<div class="text-2xl font-bold text-gray-900">{data.stats.averageProgress}%</div>
					<div class="text-sm text-gray-500">Avg. Progress</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Filters and Search -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
			<!-- Search -->
			<div class="md:col-span-2">
				<label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search Students</label>
				<div class="relative">
					<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
					<input
						type="text"
						id="search"
						bind:value={searchQuery}
						placeholder="Search by name or email..."
						class="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
					/>
				</div>
			</div>

			<!-- Status Filter -->
			<div>
				<label for="filter" class="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
				<select
					id="filter"
					bind:value={filterStatus}
					class="w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
				>
					<option value="all">All Students</option>
					<option value="active">Active</option>
					<option value="completed">Completed</option>
					<option value="not-started">Not Started</option>
				</select>
			</div>

			<!-- Sort -->
			<div>
				<label for="sort" class="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
				<select
					id="sort"
					bind:value={sortBy}
					class="w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
				>
					<option value="recent">Recently Enrolled</option>
					<option value="name">Name (A-Z)</option>
					<option value="progress">Progress</option>
					<option value="score">Score</option>
				</select>
			</div>
		</div>
	</div>

	<!-- Students List -->
	{#if filteredStudents.length === 0}
		<div class="text-center py-12">
			<Users class="mx-auto h-12 w-12 text-gray-400" />
			<h3 class="mt-2 text-sm font-medium text-gray-900">
				{data.students.length === 0 ? 'No students enrolled' : 'No students match your filters'}
			</h3>
			<p class="mt-1 text-sm text-gray-500">
				{data.students.length === 0 
					? 'Students will appear here once they enroll in your course.' 
					: 'Try adjusting your search or filter criteria.'}
			</p>
		</div>
	{:else}
		<div class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
			<div class="px-6 py-4 border-b border-gray-200">
				<h3 class="text-lg font-medium text-gray-900">
					Students ({filteredStudents.length})
				</h3>
			</div>
			
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Student
							</th>
							<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Status
							</th>
							<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Progress
							</th>
							<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Lessons Completed
							</th>
							<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Average Score
							</th>
							<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Enrolled Date
							</th>
							<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each filteredStudents as student (student.userId)}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center">
										<div class="flex-shrink-0 h-10 w-10">
											<div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
												<span class="text-sm font-medium text-indigo-600">
													{student.user.name.charAt(0).toUpperCase()}
												</span>
											</div>
										</div>
										<div class="ml-4">
											<div class="text-sm font-medium text-gray-900">{student.user.name}</div>
											<div class="text-sm text-gray-500">{student.user.email}</div>
										</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(student)}">
										{getStatusText(student)}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center">
										<div class="w-full bg-gray-200 rounded-full h-2 mr-2">
											<div 
												class="bg-indigo-600 h-2 rounded-full" 
												style="width: {student.progressPercentage}%"
											></div>
										</div>
										<span class="text-sm text-gray-500">{student.progressPercentage}%</span>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{student.lessonsCompleted} / {data.totalLessons}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{student.averageScore}%
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{formatDate(student.startedAt)}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									<a
										href="mailto:{student.user.email}"
										class="inline-flex items-center text-indigo-600 hover:text-indigo-900"
									>
										<Mail class="w-4 h-4 mr-1" />
										Contact
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
