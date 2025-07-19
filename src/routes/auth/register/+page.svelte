<script lang="ts">
	import { enhance } from '$app/forms';
	import { Mail, Lock, User, Eye, EyeOff } from 'lucide-svelte';
	import type { ActionData } from './$types';
	
	let { form }: { form: ActionData } = $props();
	
	// Local form state to prevent resets
	let formData = $state({
		name: '',
		email: '',
		password: '',
		confirmPassword: ''
	});
	
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);
	let loading = $state(false);
	
	// Initialize form data from server response
	$effect(() => {
		if (form?.name) formData.name = form.name;
		if (form?.email) formData.email = form.email;
	});
	
	function togglePassword(event: Event) {
		event.preventDefault();
		event.stopPropagation();
		event.stopImmediatePropagation();
		showPassword = !showPassword;
		return false;
	}
	
	function toggleConfirmPassword(event: Event) {
		event.preventDefault();
		event.stopPropagation();
		event.stopImmediatePropagation();
		showConfirmPassword = !showConfirmPassword;
		return false;
	}
</script>

<svelte:head>
	<title>Sign Up - NaijaLingua</title>
</svelte:head>

<div class="min-h-screen bg-neutral flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div class="text-center">
			<h2 class="text-3xl font-serif font-bold text-gray-900">Create your account</h2>
			<p class="mt-2 text-gray-600">Start your journey learning Nigerian languages</p>
		</div>
		
		<div class="card">
			<form 
				method="POST" 
				action="?/register"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update();
					};
				}}
				class="space-y-6"
			>
				{#if form?.error}
					<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
						{form.error}
					</div>
				{/if}
				
				{#if form?.success}
					<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
						{form.success}
					</div>
				{/if}
				
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700 mb-2">
						Full Name
					</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<User class="h-5 w-5 text-gray-400" />
						</div>
						<input
							type="text"
							id="name"
							name="name"
							bind:value={formData.name}
							required
							class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
							placeholder="Enter your full name"
						/>
					</div>
					{#if form?.errors?.name}
						<p class="mt-1 text-sm text-red-600">{form.errors.name[0]}</p>
					{/if}
				</div>
				
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 mb-2">
						Email address
					</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Mail class="h-5 w-5 text-gray-400" />
						</div>
						<input
							type="email"
							id="email"
							name="email"
							bind:value={formData.email}
							required
							class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
							placeholder="your@email.com"
						/>
					</div>
					{#if form?.errors?.email}
						<p class="mt-1 text-sm text-red-600">{form.errors.email[0]}</p>
					{/if}
				</div>
				
				<div>
					<label for="password" class="block text-sm font-medium text-gray-700 mb-2">
						Password
					</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Lock class="h-5 w-5 text-gray-400" />
						</div>
						<input
							type={showPassword ? 'text' : 'password'}
							id="password"
							name="password"
							bind:value={formData.password}
							required
							class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
							placeholder="Create a password"
						/>
						<button
							type="button"
							onclick={togglePassword}
							class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer select-none"
							tabindex="-1"
							aria-label="Toggle password visibility"
						>
							{#if showPassword}
								<EyeOff class="h-5 w-5 text-gray-400 hover:text-gray-600" />
							{:else}
								<Eye class="h-5 w-5 text-gray-400 hover:text-gray-600" />
							{/if}
						</button>
					</div>
					{#if form?.errors?.password}
						<p class="mt-1 text-sm text-red-600">{form.errors.password[0]}</p>
					{/if}
				</div>
				
				<div>
					<label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
						Confirm Password
					</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Lock class="h-5 w-5 text-gray-400" />
						</div>
						<input
							type={showConfirmPassword ? 'text' : 'password'}
							id="confirmPassword"
							name="confirmPassword"
							bind:value={formData.confirmPassword}
							required
							class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
							placeholder="Confirm your password"
						/>
						<button
							type="button"
							onclick={toggleConfirmPassword}
							class="absolute inset-y-0 right-0 pr-3 flex items-center"
							tabindex="-1"
						>
							{#if showConfirmPassword}
								<EyeOff class="h-5 w-5 text-gray-400 hover:text-gray-600" />
							{:else}
								<Eye class="h-5 w-5 text-gray-400 hover:text-gray-600" />
							{/if}
						</button>
					</div>
					{#if form?.errors?.confirmPassword}
						<p class="mt-1 text-sm text-red-600">{form.errors.confirmPassword[0]}</p>
					{/if}
				</div>
				
				<div class="flex items-center">
					<input
						id="terms"
						name="terms"
						type="checkbox"
						required
						class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
					/>
					<label for="terms" class="ml-2 block text-sm text-gray-700">
						I agree to the 
						<a href="/terms" class="text-primary hover:text-primary/80">Terms of Service</a>
						and 
						<a href="/privacy" class="text-primary hover:text-primary/80">Privacy Policy</a>
					</label>
				</div>
				
				<button
					type="submit"
					disabled={loading}
					class="w-full btn-primary {loading ? 'opacity-50 cursor-not-allowed' : ''}"
				>
					{loading ? 'Creating account...' : 'Create account'}
				</button>
			</form>
		</div>
		
		<div class="text-center">
			<p class="text-gray-600">
				Already have an account?
				<a href="/auth/login" class="text-primary font-medium hover:text-primary/80">
					Sign in here
				</a>
			</p>
		</div>
	</div>
</div>
