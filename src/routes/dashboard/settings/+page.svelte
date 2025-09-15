<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { User, Camera, Lock, Trash2, Save, Upload } from 'lucide-svelte';
	import { toasts } from '$lib/stores/toast';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let profileImageInput: HTMLInputElement;
	let profileImagePreview = $state(data.user.profileImage || '');
	let isUploading = $state(false);
	let uploadProgress = $state(0);

	// Handle profile image upload to Cloudinary
	async function handleImageUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith('image/')) {
			toasts.add({ message: 'Please select a valid image file', type: 'error' });
			return;
		}
		
		// Check file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			toasts.add({ message: 'Image size must be less than 5MB', type: 'error' });
			return;
		}

		isUploading = true;
		uploadProgress = 0;

		try {
			// Create form data for upload
			const formData = new FormData();
			formData.append('image', file);

			// Simulate upload progress
			const progressInterval = setInterval(() => {
				if (uploadProgress < 80) {
					uploadProgress += Math.random() * 20;
				}
			}, 100);

			// Upload to Cloudinary API endpoint
			const response = await fetch('/api/upload/profile-image', {
				method: 'POST',
				body: formData
			});

			clearInterval(progressInterval);
			uploadProgress = 100;

			const result = await response.json();

			if (response.ok && result.success) {
				profileImagePreview = result.imageUrl;
				toasts.add({ message: result.message, type: 'success' });
				
				// Update the user data to reflect the change immediately
				data.user.profileImage = result.imageUrl;
				
				// Invalidate all data to refresh the header and other components
				await invalidateAll();
			} else {
				throw new Error(result.error || 'Upload failed');
			}
		} catch (error) {
			console.error('Upload error:', error);
			toasts.add({ 
				message: error instanceof Error ? error.message : 'Failed to upload image', 
				type: 'error' 
			});
		} finally {
			isUploading = false;
			uploadProgress = 0;
		}
	}

	// Handle form submissions with toasts
	function handleFormResponse() {
		return ({ result }: any) => {
			if (result.type === 'success' && result.data?.success) {
				toasts.add({ message: result.data.message, type: 'success' });
			} else if (result.type === 'failure') {
				toasts.add({ message: result.data?.message || 'An error occurred', type: 'error' });
			}
		};
	}

	// Delete confirmation
	let showDeleteConfirmation = $state(false);
</script>

<svelte:head>
	<title>Settings - NaijaLingua</title>
</svelte:head>

<div class="p-6 max-w-4xl mx-auto">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
		<p class="text-gray-600">Manage your account preferences and profile</p>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<!-- Profile Settings -->
		<div class="lg:col-span-2">
			<div class="bg-white rounded-lg shadow-md overflow-hidden">
				<div class="px-6 py-4 border-b border-gray-200">
					<h2 class="text-xl font-semibold text-gray-900 flex items-center">
						<User class="h-5 w-5 mr-2" />
						Profile Information
					</h2>
				</div>

				<form 
					method="POST" 
					action="?/updateProfile" 
					use:enhance={handleFormResponse}
					class="p-6"
				>
					<!-- Profile Image Upload -->
					<div class="mb-6">
						<label for="profileImage" class="block text-sm font-medium text-gray-700 mb-2">
							Profile Picture
						</label>
						<div class="flex items-center space-x-6">
							<div class="relative">
								<div class="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
									{#if profileImagePreview}
										<img 
											src={profileImagePreview} 
											alt="Profile" 
											class="w-full h-full object-cover"
										/>
									{:else}
										<User class="h-10 w-10 text-gray-400" />
									{/if}
								</div>
								{#if isUploading}
									<div class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
										<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
									</div>
								{/if}
							</div>
							<div>
								<button 
									type="button"
									onclick={() => profileImageInput.click()}
									class="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
									disabled={isUploading}
								>
									<Camera class="h-4 w-4 mr-2" />
									{isUploading ? 'Uploading...' : 'Change Photo'}
								</button>
								<input 
									bind:this={profileImageInput}
									id="profileImage"
									type="file" 
									accept="image/*" 
									onchange={handleImageUpload}
									class="hidden"
								/>
								<p class="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
							</div>
						</div>
						<!-- Remove the hidden input since we're now uploading directly -->
					</div>

					<!-- Name Field -->
					<div class="mb-6">
						<label for="name" class="block text-sm font-medium text-gray-700 mb-2">
							Full Name
						</label>
						<input 
							type="text" 
							id="name" 
							name="name" 
							value={data.user.name}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
							required
						/>
					</div>

					<!-- Email Field -->
					<div class="mb-6">
						<label for="email" class="block text-sm font-medium text-gray-700 mb-2">
							Email Address
						</label>
						<input 
							type="email" 
							id="email" 
							name="email" 
							value={data.user.email}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
							required
						/>
					</div>

					<!-- Bio Field -->
					<div class="mb-6">
						<label for="bio" class="block text-sm font-medium text-gray-700 mb-2">
							Bio
						</label>
						<textarea 
							id="bio" 
							name="bio" 
							rows="4"
							value={data.user.bio || ''}
							placeholder="Tell us about yourself..."
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
						></textarea>
					</div>

					<button 
						type="submit" 
						class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center"
					>
						<Save class="h-4 w-4 mr-2" />
						Save Changes
					</button>
				</form>
			</div>

			<!-- Password Change -->
			<div class="bg-white rounded-lg shadow-md overflow-hidden mt-6">
				<div class="px-6 py-4 border-b border-gray-200">
					<h2 class="text-xl font-semibold text-gray-900 flex items-center">
						<Lock class="h-5 w-5 mr-2" />
						Change Password
					</h2>
				</div>

				<form 
					method="POST" 
					action="?/changePassword" 
					use:enhance={handleFormResponse}
					class="p-6"
				>
					<div class="mb-4">
						<label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-2">
							Current Password
						</label>
						<input 
							type="password" 
							id="currentPassword" 
							name="currentPassword" 
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
							required
						/>
					</div>

					<div class="mb-4">
						<label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">
							New Password
						</label>
						<input 
							type="password" 
							id="newPassword" 
							name="newPassword" 
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
							required
						/>
					</div>

					<div class="mb-6">
						<label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
							Confirm New Password
						</label>
						<input 
							type="password" 
							id="confirmPassword" 
							name="confirmPassword" 
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
							required
						/>
					</div>

					<button 
						type="submit" 
						class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center"
					>
						<Lock class="h-4 w-4 mr-2" />
						Update Password
					</button>
				</form>
			</div>
		</div>

		<!-- Account Info & Danger Zone -->
		<div class="space-y-6">
			<!-- Account Information -->
			<div class="bg-white rounded-lg shadow-md overflow-hidden">
				<div class="px-6 py-4 border-b border-gray-200">
					<h3 class="text-lg font-semibold text-gray-900">Account Information</h3>
				</div>
				<div class="p-6 space-y-4">
					<div>
						<dt class="text-sm font-medium text-gray-500">Account Type</dt>
						<dd class="text-sm text-gray-900 capitalize">{data.user.role.toLowerCase()}</dd>
					</div>
					<div>
						<dt class="text-sm font-medium text-gray-500">Member Since</dt>
						<dd class="text-sm text-gray-900">
							{new Date(data.user.createdAt).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})}
						</dd>
					</div>
					<div>
						<dt class="text-sm font-medium text-gray-500">Account Status</dt>
						<dd class="text-sm">
							{#if data.user.banned}
								<span class="text-red-600 font-medium">Banned</span>
							{:else if data.user.suspended}
								<span class="text-yellow-600 font-medium">Suspended</span>
							{:else}
								<span class="text-green-600 font-medium">Active</span>
							{/if}
						</dd>
					</div>
				</div>
			</div>

			<!-- Danger Zone -->
			<div class="bg-white rounded-lg shadow-md overflow-hidden border border-red-200">
				<div class="px-6 py-4 border-b border-red-200 bg-red-50">
					<h3 class="text-lg font-semibold text-red-900">Danger Zone</h3>
				</div>
				<div class="p-6">
					<p class="text-sm text-gray-600 mb-4">
						Once you delete your account, there is no going back. All your data, including courses, progress, and certificates will be permanently deleted.
					</p>
					
					{#if !showDeleteConfirmation}
						<button 
							onclick={() => showDeleteConfirmation = true}
							class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
						>
							<Trash2 class="h-4 w-4 mr-2" />
							Delete Account
						</button>
					{:else}
						<div class="border border-red-200 rounded-lg p-4 bg-red-50">
							<h4 class="font-medium text-red-900 mb-2">Confirm Account Deletion</h4>
							<p class="text-sm text-red-700 mb-4">
								This action cannot be undone. Please enter your password to confirm.
							</p>
							
							<form 
								method="POST" 
								action="?/deleteAccount" 
								use:enhance={handleFormResponse}
								class="space-y-4"
							>
								<input 
									type="password" 
									name="confirmPassword" 
									placeholder="Enter your password"
									class="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
									required
								/>
								<div class="flex space-x-3">
									<button 
										type="submit" 
										class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
									>
										<Trash2 class="h-4 w-4 mr-2" />
										Delete Forever
									</button>
									<button 
										type="button"
										onclick={() => showDeleteConfirmation = false}
										class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
									>
										Cancel
									</button>
								</div>
							</form>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
