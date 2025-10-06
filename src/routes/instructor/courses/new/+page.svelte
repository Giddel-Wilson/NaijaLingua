<script lang="ts">
	import { 
		ArrowLeft,
		Upload,
		ImageIcon,
		Save,
		Eye
	} from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import AlertModal from '$lib/components/AlertModal.svelte';

	let isLoading = false;
	let previewImage: string | null = null;
	let imageFile: File | null = null;
	
	// Modal states
	let showAlertModal = $state(false);
	let alertMessage = $state('');
	let alertTitle = $state('');
	let alertType = $state<'success' | 'error' | 'warning' | 'info'>('error');

	// Form data
	let courseData = {
		title: '',
		description: '',
		language: 'YORUBA',
		level: 'BEGINNER',
		category: '',
		price: 0,
		currency: 'USD'
	};

	let tags: string[] = [];
	let currentTag = '';

	const languages = [
		'YORUBA', 'IGBO', 'HAUSA', 'PIDGIN', 'EDO', 'FULANI', 
		'KANURI', 'TIV', 'EFIK', 'FULFULDE', 'IBIBIO', 'IJAW'
	];

	const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

	const categories = [
		'Language Basics',
		'Conversation',
		'Grammar',
		'Vocabulary',
		'Pronunciation',
		'Culture & Traditions',
		'Business Language',
		'Academic Language'
	];

	function handleImageUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		
		if (file) {
			imageFile = file;
			const reader = new FileReader();
			reader.onload = (e) => {
				previewImage = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	function addTag() {
		if (currentTag.trim() && !tags.includes(currentTag.trim())) {
			tags = [...tags, currentTag.trim()];
			currentTag = '';
		}
	}

	function removeTag(tagToRemove: string) {
		tags = tags.filter(tag => tag !== tagToRemove);
	}

	function handleTagKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			addTag();
		}
	}

	async function handleSubmit(event: Event, isDraft = true) {
		event.preventDefault();
		
		if (!courseData.title.trim()) {
			alertTitle = 'Validation Error';
			alertMessage = 'Please enter a course title';
			alertType = 'warning';
			showAlertModal = true;
			return;
		}

		isLoading = true;

		try {
			const formData = new FormData();
			
			// Add course data
			Object.entries(courseData).forEach(([key, value]) => {
				formData.append(key, value.toString());
			});
			
			formData.append('tags', JSON.stringify(tags));
			formData.append('isPublished', (!isDraft).toString());
			
			// Add image if selected
			if (imageFile) {
				formData.append('image', imageFile);
			}

			const response = await fetch('/api/courses', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				const result = await response.json();
				goto(`/instructor/courses/${result.id}`);
			} else {
				const error = await response.text();
				alertTitle = 'Creation Failed';
				alertMessage = `Failed to create course: ${error}`;
				alertType = 'error';
				showAlertModal = true;
			}
		} catch (error) {
			console.error('Error creating course:', error);
			alertTitle = 'Creation Failed';
			alertMessage = 'Failed to create course. Please try again.';
			alertType = 'error';
			showAlertModal = true;
		} finally {
			isLoading = false;
		}
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
</script>

<svelte:head>
	<title>Create New Course - Instructor Dashboard</title>
</svelte:head>

<div class="max-w-4xl mx-auto space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center space-x-4">
			<button 
				on:click={() => goto('/instructor/courses')}
				class="p-2 rounded-lg border hover:bg-gray-50 transition-colors"
			>
				<ArrowLeft class="h-5 w-5" />
			</button>
			<div>
				<h1 class="text-2xl font-bold text-gray-900">Create New Course</h1>
				<p class="text-gray-600">Share your knowledge with students worldwide</p>
			</div>
		</div>
	</div>

	<form on:submit={(e) => handleSubmit(e, true)} class="space-y-8">
		<!-- Basic Information -->
		<div class="bg-white rounded-lg shadow-sm border p-6">
			<h2 class="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
			
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<!-- Course Title -->
				<div class="lg:col-span-2">
					<label for="title" class="block text-sm font-medium text-gray-700 mb-2">
						Course Title *
					</label>
					<input
						type="text"
						id="title"
						bind:value={courseData.title}
						placeholder="e.g., Complete Yoruba for Beginners"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
						required
					/>
				</div>

				<!-- Language -->
				<div>
					<label for="language" class="block text-sm font-medium text-gray-700 mb-2">
						Language *
					</label>
					<div class="relative">
						<select
							id="language"
							bind:value={courseData.language}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none pr-10"
							required
						>
							{#each languages as language}
								<option value={language}>{getLanguageFlag(language)} {language}</option>
							{/each}
						</select>
					</div>
				</div>

				<!-- Level -->
				<div>
					<label for="level" class="block text-sm font-medium text-gray-700 mb-2">
						Level *
					</label>
					<select
						id="level"
						bind:value={courseData.level}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
						required
					>
						{#each levels as level}
							<option value={level}>{level}</option>
						{/each}
					</select>
				</div>

				<!-- Category -->
				<div>
					<label for="category" class="block text-sm font-medium text-gray-700 mb-2">
						Category
					</label>
					<select
						id="category"
						bind:value={courseData.category}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
					>
						<option value="">Select a category</option>
						{#each categories as category}
							<option value={category}>{category}</option>
						{/each}
					</select>
				</div>

				<!-- Price -->
				<div>
					<label for="price" class="block text-sm font-medium text-gray-700 mb-2">
						Price
					</label>
					<div class="flex">
						<select
							bind:value={courseData.currency}
							class="px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
						>
							<option value="USD">USD</option>
							<option value="NGN">NGN</option>
							<option value="EUR">EUR</option>
						</select>
						<input
							type="number"
							id="price"
							bind:value={courseData.price}
							min="0"
							step="0.01"
							placeholder="0.00"
							class="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
						/>
					</div>
					<p class="text-xs text-gray-500 mt-1">Set to 0 for free course</p>
				</div>
			</div>

			<!-- Description -->
			<div class="mt-6">
				<label for="description" class="block text-sm font-medium text-gray-700 mb-2">
					Course Description
				</label>
				<textarea
					id="description"
					bind:value={courseData.description}
					rows="4"
					placeholder="Describe what students will learn in this course..."
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
				></textarea>
			</div>

			<!-- Tags -->
			<div class="mt-6">
				<label class="block text-sm font-medium text-gray-700 mb-2">
					Tags
				</label>
				<div class="flex flex-wrap gap-2 mb-3">
					{#each tags as tag}
						<span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
							{tag}
							<button
								type="button"
								on:click={() => removeTag(tag)}
								class="ml-2 text-green-500 hover:text-green-700"
							>
								×
							</button>
						</span>
					{/each}
				</div>
				<div class="flex">
					<input
						type="text"
						bind:value={currentTag}
						on:keypress={handleTagKeyPress}
						placeholder="Add a tag and press Enter"
						class="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
					/>
					<button
						type="button"
						on:click={addTag}
						class="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200 transition-colors"
					>
						Add
					</button>
				</div>
			</div>
		</div>

		<!-- Course Image -->
		<div class="bg-white rounded-lg shadow-sm border p-6">
			<h2 class="text-lg font-semibold text-gray-900 mb-6">Course Image</h2>
			
			<div class="space-y-4">
				{#if previewImage}
					<div class="relative">
						<img src={previewImage} alt="Course preview" class="w-full h-64 object-cover rounded-lg border" />
						<button
							type="button"
							on:click={() => { previewImage = null; imageFile = null; }}
							class="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
						>
							×
						</button>
					</div>
				{:else}
					<div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
						<ImageIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<h3 class="text-lg font-medium text-gray-900 mb-2">Upload Course Image</h3>
						<p class="text-gray-600 mb-4">Choose an eye-catching image for your course</p>
						<label class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
							<Upload class="h-4 w-4 mr-2" />
							Choose Image
							<input
								type="file"
								accept="image/*"
								on:change={handleImageUpload}
								class="hidden"
							/>
						</label>
					</div>
				{/if}
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-col sm:flex-row gap-4 justify-end">
			<button
				type="button"
				on:click={(e) => handleSubmit(e, true)}
				disabled={isLoading}
				class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#if isLoading}
					Creating...
				{:else}
					<Save class="h-4 w-4 mr-2 inline" />
					Save as Draft
				{/if}
			</button>
			
			<button
				type="button"
				on:click={(e) => handleSubmit(e, false)}
				disabled={isLoading || !courseData.title.trim()}
				class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#if isLoading}
					Publishing...
				{:else}
					<Eye class="h-4 w-4 mr-2 inline" />
					Create & Publish
				{/if}
			</button>
		</div>
	</form>
</div>

<!-- Alert Modal -->
<AlertModal
	bind:show={showAlertModal}
	title={alertTitle}
	message={alertMessage}
	type={alertType}
/>
