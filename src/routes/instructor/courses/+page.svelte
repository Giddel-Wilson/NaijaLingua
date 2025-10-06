<script lang="ts">
	import { 
		BookOpen, 
		Users, 
		Eye,
		Edit,
		Trash2,
		Plus,
		Search,
		Filter,
		Calendar,
		MoreVertical
	} from 'lucide-svelte';
	import AlertModal from '$lib/components/AlertModal.svelte';
	import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let showFilterDropdown = false;
	
	// Modal states
	let showAlertModal = $state(false);
	let alertMessage = $state('');
	let alertTitle = $state('');
	let alertType = $state<'success' | 'error' | 'warning' | 'info'>('error');
	
	let showDeleteConfirm = $state(false);
	let courseIdToDelete = $state<string | null>(null);

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function getLanguageFlag(language: string) {
		const flags: Record<string, string> = {
			YORUBA: '🟢',
			IGBO: '🔵',
			HAUSA: '🟡',
			PIDGIN: '🟠',
			EDO: '🟣',
			FULANI: '🔴',
			KANURI: '⚪',
			TIV: '🟤',
			EFIK: '🟤',
			FULFULDE: '🔴',
			IBIBIO: '🟣',
			IJAW: '🟡'
		};
		return flags[language] || '🌍';
	}

	function updateFilter(key: string, value: string) {
		const url = new URL($page.url);
		if (value === 'all' || value === '') {
			url.searchParams.delete(key);
		} else {
			url.searchParams.set(key, value);
		}
		goto(url.toString());
	}

	function handleSearch(event: Event) {
		const target = event.target as HTMLInputElement;
		updateFilter('search', target.value);
	}

	async function deleteCourse(courseId: string) {
		courseIdToDelete = courseId;
		showDeleteConfirm = true;
	}
	
	async function confirmDelete() {
		if (!courseIdToDelete) return;

		try {
			const response = await fetch(`/api/courses/${courseIdToDelete}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				// Reload page to update course list
				window.location.reload();
			} else {
				alertTitle = 'Delete Failed';
				alertMessage = 'Failed to delete course';
				alertType = 'error';
				showAlertModal = true;
			}
		} catch (error) {
			console.error('Error deleting course:', error);
			alertTitle = 'Delete Failed';
			alertMessage = 'Failed to delete course';
			alertType = 'error';
			showAlertModal = true;
		}
	}

	async function togglePublishStatus(courseId: string, currentStatus: boolean) {
		try {
			const response = await fetch(`/api/courses/${courseId}/publish`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					isPublished: !currentStatus
				})
			});

			if (response.ok) {
				// Reload page to update course list
				window.location.reload();
			} else {
				alertTitle = 'Update Failed';
				alertMessage = 'Failed to update course status';
				alertType = 'error';
				showAlertModal = true;
			}
		} catch (error) {
			console.error('Error updating course status:', error);
			alertTitle = 'Update Failed';
			alertMessage = 'Failed to update course status';
			alertType = 'error';
			showAlertModal = true;
		}
	}
</script>

<svelte:head>
	<title>My Courses - Instructor Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900">My Courses</h1>
			<p class="text-gray-600 mt-1">Manage your courses and track student progress</p>
		</div>
		<div class="mt-4 sm:mt-0">
			<a 
				href="/instructor/courses/new"
				class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
			>
				<Plus class="h-4 w-4 mr-2" />
				Create Course
			</a>
		</div>
	</div>

	<!-- Filters and Search -->
	<div class="bg-white rounded-lg shadow-sm border p-6">
		<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
			<!-- Search -->
			<div class="relative">
				<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
				<input
					type="text"
					placeholder="Search courses..."
					value={data.filters.search}
					on:input={handleSearch}
					class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full lg:w-80"
				/>
			</div>

			<!-- Filter Controls -->
			<div class="flex flex-wrap gap-4">
				<!-- Status Filter -->
				<select
					value={data.filters.status}
					on:change={(e) => updateFilter('status', e.currentTarget.value)}
					class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
				>
					<option value="all">All Status</option>
					<option value="published">Published</option>
					<option value="draft">Draft</option>
				</select>

				<!-- Language Filter -->
				<select
					value={data.filters.language}
					on:change={(e) => updateFilter('language', e.currentTarget.value)}
					class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
				>
					<option value="all">All Languages</option>
					{#each data.languages as language}
						<option value={language}>{language}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>

	<!-- Courses Grid -->
	{#if data.courses.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each data.courses as course}
				<div class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
					<!-- Course Image -->
					<div class="relative h-48 bg-gradient-to-br from-green-500 to-green-600 rounded-t-lg">
						{#if course.imageUrl}
							<img src={course.imageUrl} alt={course.title} class="w-full h-full object-cover rounded-t-lg" />
						{:else}
							<div class="flex items-center justify-center h-full">
								<span class="text-6xl">{getLanguageFlag(course.language)}</span>
							</div>
						{/if}
						
						<!-- Status Badge -->
						<div class="absolute top-4 left-4">
							<span class="px-2 py-1 text-xs font-medium rounded-full {course.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
								{course.isPublished ? 'Published' : 'Draft'}
							</span>
						</div>

						<!-- Actions Menu -->
						<div class="absolute top-4 right-4">
							<div class="relative">
								<button class="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors">
									<MoreVertical class="h-4 w-4 text-gray-600" />
								</button>
							</div>
						</div>
					</div>

					<!-- Course Content -->
					<div class="p-6">
						<div class="flex items-start justify-between mb-3">
							<h3 class="font-semibold text-lg text-gray-900 line-clamp-2">{course.title}</h3>
						</div>

						{#if course.description}
							<p class="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
						{/if}

						<!-- Course Stats -->
						<div class="flex items-center justify-between text-sm text-gray-500 mb-4">
							<div class="flex items-center space-x-4">
								<span class="flex items-center">
									<Users class="h-4 w-4 mr-1" />
									{course._count.enrollments}
								</span>
								<span class="flex items-center">
									<BookOpen class="h-4 w-4 mr-1" />
									{course._count.lessons}
								</span>
							</div>
							<span class="flex items-center">
								<Calendar class="h-4 w-4 mr-1" />
								{formatDate(course.updatedAt)}
							</span>
						</div>

						<!-- Language and Level -->
						<div class="flex items-center justify-between mb-4">
							<div class="flex items-center space-x-2">
								<span class="text-lg">{getLanguageFlag(course.language)}</span>
								<span class="text-sm font-medium text-gray-700">{course.language}</span>
							</div>
							<span class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">{course.level}</span>
						</div>

						<!-- Action Buttons -->
						<div class="flex space-x-2">
							<a 
								href="/instructor/courses/{course.id}"
								class="flex-1 flex items-center justify-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
							>
								<Eye class="h-4 w-4 mr-1" />
								View
							</a>
							<a 
								href="/instructor/courses/{course.id}/edit"
								class="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
							>
								<Edit class="h-4 w-4 mr-1" />
								Edit
							</a>
							<button
								on:click={() => togglePublishStatus(course.id, course.isPublished)}
								class="px-3 py-2 text-sm {course.isPublished ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg transition-colors"
							>
								{course.isPublished ? 'Unpublish' : 'Publish'}
							</button>
							<button
								on:click={() => deleteCourse(course.id)}
								class="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
							>
								<Trash2 class="h-4 w-4" />
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<!-- Empty State -->
		<div class="bg-white rounded-lg shadow-sm border">
			<div class="text-center py-16">
				<BookOpen class="h-16 w-16 text-gray-400 mx-auto mb-4" />
				<h3 class="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
				<p class="text-gray-600 mb-6">
					{data.filters.search || data.filters.status !== 'all' || data.filters.language !== 'all' 
						? 'Try adjusting your filters to see more courses.' 
						: 'Start by creating your first course to share your knowledge with students.'}
				</p>
				<a 
					href="/instructor/courses/new"
					class="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
				>
					<Plus class="h-5 w-5 mr-2" />
					Create Your First Course
				</a>
			</div>
		</div>
	{/if}
</div>

<!-- Alert Modal -->
<AlertModal
	bind:show={showAlertModal}
	title={alertTitle}
	message={alertMessage}
	type={alertType}
/>

<!-- Delete Confirmation Modal -->
<ConfirmationModal
	bind:show={showDeleteConfirm}
	message="Are you sure you want to delete this course? This action cannot be undone."
	onConfirm={confirmDelete}
/>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
