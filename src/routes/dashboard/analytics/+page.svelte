<script lang="ts">
	import { 
		BarChart3, 
		TrendingUp, 
		Users, 
		Award, 
		BookOpen,
		Globe,
		Brain,
		Activity,
		Calendar,
		Target,
		Zap
	} from 'lucide-svelte';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	
	const formatLanguage = (lang: string) => {
		return lang.charAt(0) + lang.slice(1).toLowerCase();
	};
	
	const getLanguageFlag = (lang: string) => {
		const flags: Record<string, string> = {
			'IGBO': '🇳🇬',
			'YORUBA': '🇳🇬',
			'HAUSA': '🇳🇬',
			'SWAHILI': '🇹🇿',
			'AMHARIC': '🇪🇹',
			'WOLOF': '🇸🇳',
			'AKAN': '🇬🇭',
			'ZULU': '🇿🇦'
		};
		return flags[lang] || '🌍';
	};
	
	const getSourceColor = (source: string) => {
		const colors: Record<string, string> = {
			'MAVEN': 'bg-blue-100 text-blue-700',
			'IGBO_API': 'bg-green-100 text-green-700',
			'LANFRICA': 'bg-purple-100 text-purple-700',
			'COMMONVOICE': 'bg-orange-100 text-orange-700',
			'Manual': 'bg-gray-100 text-gray-700'
		};
		return colors[source] || 'bg-gray-100 text-gray-700';
	};
</script>

<svelte:head>
	<title>Analytics - NaijaLingua</title>
</svelte:head>

<div class="p-8">
	<!-- Header -->
	<div class="mb-8">
		<div class="flex items-center gap-3 mb-4">
			<div class="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
				<BarChart3 class="w-6 h-6 text-white" />
			</div>
			<div>
				<h1 class="text-3xl font-bold text-gray-900">Course Analytics</h1>
				<p class="text-gray-600">Track the performance of your African language courses</p>
			</div>
		</div>
	</div>
	
	<!-- Key Metrics -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-gray-600 text-sm font-medium">Total Courses</p>
					<p class="text-3xl font-bold text-gray-900">{data.analytics.totalCourses}</p>
					<p class="text-green-600 text-sm mt-1">
						{Object.keys(data.analytics.languageStats).length} languages
					</p>
				</div>
				<div class="p-3 bg-blue-100 rounded-full">
					<BookOpen class="w-6 h-6 text-blue-600" />
				</div>
			</div>
		</div>
		
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-gray-600 text-sm font-medium">Total Enrollments</p>
					<p class="text-3xl font-bold text-gray-900">{data.analytics.totalEnrollments}</p>
					<p class="text-blue-600 text-sm mt-1">Active learners</p>
				</div>
				<div class="p-3 bg-green-100 rounded-full">
					<Users class="w-6 h-6 text-green-600" />
				</div>
			</div>
		</div>
		
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-gray-600 text-sm font-medium">Certificates Issued</p>
					<p class="text-3xl font-bold text-gray-900">{data.analytics.totalCertificates}</p>
					<p class="text-purple-600 text-sm mt-1">Completions</p>
				</div>
				<div class="p-3 bg-purple-100 rounded-full">
					<Award class="w-6 h-6 text-purple-600" />
				</div>
			</div>
		</div>
		
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-gray-600 text-sm font-medium">Completion Rate</p>
					<p class="text-3xl font-bold text-gray-900">{data.analytics.completionRate}%</p>
					<p class="text-orange-600 text-sm mt-1">Average success</p>
				</div>
				<div class="p-3 bg-orange-100 rounded-full">
					<Target class="w-6 h-6 text-orange-600" />
				</div>
			</div>
		</div>
	</div>
	
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
		<!-- Language Distribution -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
			<h3 class="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
				<Globe class="w-5 h-5 text-blue-500" />
				Language Distribution
			</h3>
			<div class="space-y-4">
				{#each Object.entries(data.analytics.languageStats) as [language, stats]}
					<div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
						<div class="flex items-center gap-3">
							<div class="text-2xl">{getLanguageFlag(language)}</div>
							<div>
								<div class="font-medium text-gray-900">{formatLanguage(language)}</div>
								<div class="text-sm text-gray-600">
									{stats.courses} courses • {stats.enrollments} students
								</div>
							</div>
						</div>
						<div class="text-right">
							<div class="text-lg font-bold text-gray-900">{stats.completions}</div>
							<div class="text-xs text-gray-600">certificates</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
		
		<!-- AI Content Sources -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
			<h3 class="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
				<Brain class="w-5 h-5 text-purple-500" />
				Content Sources
			</h3>
			<div class="space-y-3">
				{#each Object.entries(data.analytics.contentSourceStats) as [source, count]}
					<div class="flex items-center justify-between p-3 rounded-lg {getSourceColor(source)}">
						<div class="flex items-center gap-2">
							<Zap class="w-4 h-4" />
							<span class="font-medium">{source}</span>
						</div>
						<span class="font-bold">{count} lessons</span>
					</div>
				{/each}
			</div>
			<div class="mt-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
				<p class="text-sm text-gray-700">
					<strong>AI-generated content</strong> from MAVEN, Igbo API, CommonVoice, and Lanfrica 
					provides authentic African language learning experiences.
				</p>
			</div>
		</div>
	</div>
	
	<!-- Course Performance -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
		<h3 class="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
			<TrendingUp class="w-5 h-5 text-green-500" />
			Course Performance
		</h3>
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead>
					<tr class="border-b border-gray-200">
						<th class="text-left py-3 px-4 font-medium text-gray-700">Course</th>
						<th class="text-left py-3 px-4 font-medium text-gray-700">Language</th>
						<th class="text-center py-3 px-4 font-medium text-gray-700">Enrollments</th>
						<th class="text-center py-3 px-4 font-medium text-gray-700">Avg Progress</th>
						<th class="text-center py-3 px-4 font-medium text-gray-700">Completion Rate</th>
						<th class="text-center py-3 px-4 font-medium text-gray-700">AI Content</th>
					</tr>
				</thead>
				<tbody>
					{#each data.courses as course}
						<tr class="border-b border-gray-100 hover:bg-gray-50">
							<td class="py-4 px-4">
								<div class="font-medium text-gray-900">{course.title}</div>
								<div class="text-sm text-gray-600">{course.level}</div>
							</td>
							<td class="py-4 px-4">
								<div class="flex items-center gap-2">
									<span class="text-lg">{getLanguageFlag(course.language)}</span>
									<span class="font-medium">{formatLanguage(course.language)}</span>
								</div>
							</td>
							<td class="py-4 px-4 text-center">
								<div class="flex items-center justify-center gap-1">
									<Users class="w-4 h-4 text-gray-400" />
									<span class="font-medium">{course.enrollments}</span>
								</div>
							</td>
							<td class="py-4 px-4 text-center">
								<div class="flex items-center justify-center">
									<div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
										<div 
											class="bg-blue-500 h-2 rounded-full transition-all duration-300" 
											style="width: {course.avgProgress}%"
										></div>
									</div>
									<span class="text-sm font-medium">{course.avgProgress}%</span>
								</div>
							</td>
							<td class="py-4 px-4 text-center">
								<div class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
									{course.completionRate >= 80 ? 'bg-green-100 text-green-800' : 
									 course.completionRate >= 60 ? 'bg-yellow-100 text-yellow-800' : 
									 'bg-red-100 text-red-800'}">
									{course.completionRate}%
								</div>
							</td>
							<td class="py-4 px-4 text-center">
								{#if course.hasAIContent}
									<div class="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
										<Brain class="w-3 h-3" />
										AI Generated
									</div>
								{:else}
									<span class="text-gray-400 text-xs">Manual</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
	
	<!-- Recent Activity -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
		<h3 class="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
			<Activity class="w-5 h-5 text-indigo-500" />
			Recent Enrollments
		</h3>
		<div class="space-y-3">
			{#each data.analytics.recentEnrollments.slice(0, 5) as enrollment}
				<div class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
							<Users class="w-4 h-4 text-indigo-600" />
						</div>
						<div>
							<div class="font-medium text-gray-900">{enrollment.user?.name}</div>
							<div class="text-sm text-gray-600">
								{enrollment.courseName} • {getLanguageFlag(enrollment.courseLanguage)} {formatLanguage(enrollment.courseLanguage)}
							</div>
						</div>
					</div>
					<div class="text-right">
						<div class="text-sm text-gray-600">
							{new Date(enrollment.startedAt).toLocaleDateString()}
						</div>
						<div class="text-xs text-gray-500">
							{Math.round(enrollment.progress)}% progress
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
