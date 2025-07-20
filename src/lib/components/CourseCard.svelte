<script lang="ts">
	import { BookOpen, Users, Star, Clock } from 'lucide-svelte';
	import { formatLanguage, formatLevel } from '$lib/utils';
	import type { Course, Lesson, Enrollment, User } from '@prisma/client';
	
	let { 
		course 
	}: { 
		course: Course & {
			lessons: Pick<Lesson, 'id'>[];
			enrollments: Pick<Enrollment, 'userId'>[];
			createdBy: Pick<User, 'name'>;
		}
	} = $props();
	
	const studentCount = $derived(course.enrollments.length);
	const lessonCount = $derived(course.lessons.length);
	
	function getCourseGradient(language: string) {
		const gradients: Record<string, string> = {
			'YORUBA': 'from-emerald-400 to-emerald-600',
			'IGBO': 'from-blue-400 to-blue-600',
			'HAUSA': 'from-purple-400 to-purple-600',
			'EFIK': 'from-orange-400 to-orange-600',
			'TIV': 'from-red-400 to-red-600',
			'FULFULDE': 'from-pink-400 to-pink-600',
			'KANURI': 'from-indigo-400 to-indigo-600',
			'IBIBIO': 'from-cyan-400 to-cyan-600',
			'EDO': 'from-yellow-400 to-yellow-600',
			'IJAW': 'from-teal-400 to-teal-600'
		};
		return gradients[language] || 'from-gray-400 to-gray-600';
	}
</script>

<div class="card-hover group">
	<!-- Course Header -->
	<div class="h-48 bg-gradient-to-br {getCourseGradient(course.language)} rounded-lg mb-6 flex items-center justify-center relative overflow-hidden">
		<span class="text-3xl font-serif text-white z-10">
			{formatLanguage(course.language)}
		</span>
		<div class="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
	</div>
	
	<!-- Course Content -->
	<div class="space-y-4">
		<div>
			<h3 class="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
				{course.title}
			</h3>
			{#if course.description}
				<p class="text-gray-600 text-sm line-clamp-2">
					{course.description}
				</p>
			{/if}
		</div>
		
		<!-- Course Meta -->
		<div class="flex items-center justify-between text-sm text-gray-500">
			<div class="flex items-center space-x-4">
				<span class="flex items-center">
					<BookOpen class="w-4 h-4 mr-1" />
					{lessonCount} lessons
				</span>
				<span class="flex items-center">
					<Users class="w-4 h-4 mr-1" />
					{studentCount} students
				</span>
			</div>
			<span class="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
				{formatLevel(course.level)}
			</span>
		</div>
		
		<!-- Instructor and Rating -->
		<div class="flex items-center justify-between">
			<span class="text-sm text-gray-600">
				by {course.createdBy.name}
			</span>
			<div class="flex items-center">
				{#each Array(5) as _}
					<Star class="w-4 h-4 text-gold fill-current" />
				{/each}
			</div>
		</div>
		
		<!-- Action Button -->
		<a 
			href="/courses/{course.id}" 
			class="block w-full text-center btn-primary group-hover:bg-primary/90"
		>
			View Course
		</a>
	</div>
</div>
