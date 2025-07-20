<script lang="ts">
	import { ArrowRight, BookOpen, Users, Award, Globe, PlayCircle, Star } from 'lucide-svelte';
	
	const languages = [
		{ name: 'Yoruba', speakers: '20M+', color: 'bg-emerald-500' },
		{ name: 'Igbo', speakers: '24M+', color: 'bg-blue-500' },
		{ name: 'Hausa', speakers: '30M+', color: 'bg-purple-500' },
		{ name: 'Efik', speakers: '1M+', color: 'bg-orange-500' },
		{ name: 'Tiv', speakers: '2.5M+', color: 'bg-red-500' },
		{ name: 'Fulfulde', speakers: '4M+', color: 'bg-pink-500' }
	];
	
	const features = [
		{
			icon: BookOpen,
			title: 'Interactive Lessons',
			description: 'Learn through multimedia content with audio, images, and cultural context'
		},
		{
			icon: PlayCircle,
			title: 'Native Pronunciation',
			description: 'Practice with authentic audio from native speakers'
		},
		{
			icon: Award,
			title: 'Earn Certificates',
			description: 'Get recognized with official certificates upon course completion'
		},
		{
			icon: Users,
			title: 'Community Learning',
			description: 'Connect with other learners and native speakers'
		}
	];
	
	const testimonials = [
		{
			name: 'Adaora Okafor',
			role: 'Software Engineer',
			content: 'NaijaLingua helped me reconnect with my Igbo roots. The lessons are engaging and culturally rich.',
			rating: 5
		},
		{
			name: 'Kunle Adebayo',
			role: 'Student',
			content: 'As a diaspora Nigerian, this platform has been invaluable in learning Yoruba. Highly recommend!',
			rating: 5
		},
		{
			name: 'Fatima Sule',
			role: 'Language Enthusiast',
			content: 'The pronunciation exercises are excellent. I can finally speak Hausa with confidence.',
			rating: 5
		}
	];
</script>

<svelte:head>
	<title>NaijaLingua - Learn Nigerian Languages Online</title>
	<meta name="description" content="Learn indigenous Nigerian languages like Yoruba, Igbo, Hausa, and more through interactive lessons, audio pronunciation, and cultural insights." />
</svelte:head>

<!-- Hero Section -->
<section class="relative bg-gradient-to-br from-primary to-primary/80 text-white overflow-hidden">
	<div class="absolute inset-0 bg-black/10"></div>
	<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
			<div class="text-center lg:text-left">
				<h1 class="text-4xl lg:text-6xl font-serif font-bold mb-6">
					Learn Nigerian Languages
					<span class="text-gold">the Modern Way</span>
				</h1>
				<p class="text-xl text-white/90 mb-8 max-w-2xl">
					Preserve and master indigenous Nigerian languages through interactive lessons, 
					cultural insights, and authentic pronunciation from native speakers.
				</p>
				<div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
					<a href="/auth/register" class="btn-secondary inline-flex items-center">
						Start Learning Free <ArrowRight class="ml-2 w-5 h-5" />
					</a>
					<a href="/courses" class="btn-outline border-white text-white hover:bg-white hover:text-primary">
						Explore Courses
					</a>
				</div>
			</div>
			
			<div class="flex justify-center lg:justify-end">
				<div class="grid grid-cols-2 gap-4 max-w-md">
					{#each languages as language}
						<div class="card bg-white/10 backdrop-blur-sm border-white/20 text-center">
							<div class="w-12 h-12 {language.color} rounded-full mx-auto mb-3"></div>
							<h3 class="font-semibold text-white">{language.name}</h3>
							<p class="text-white/70 text-sm">{language.speakers} speakers</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Stats Section -->
<section class="bg-white py-16">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
			<div>
				<div class="text-3xl font-bold text-primary mb-2">10+</div>
				<div class="text-gray-600">Nigerian Languages</div>
			</div>
			<div>
				<div class="text-3xl font-bold text-primary mb-2">500+</div>
				<div class="text-gray-600">Interactive Lessons</div>
			</div>
			<div>
				<div class="text-3xl font-bold text-primary mb-2">1,000+</div>
				<div class="text-gray-600">Active Learners</div>
			</div>
			<div>
				<div class="text-3xl font-bold text-primary mb-2">95%</div>
				<div class="text-gray-600">Completion Rate</div>
			</div>
		</div>
	</div>
</section>

<!-- Features Section -->
<section class="py-20 bg-neutral">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-16">
			<h2 class="text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-4">
				Why Choose NaijaLingua?
			</h2>
			<p class="text-xl text-gray-600 max-w-3xl mx-auto">
				Our platform combines modern technology with traditional wisdom to create 
				the most effective way to learn Nigerian languages.
			</p>
		</div>
		
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
			{#each features as feature}
				<div class="card-hover text-center">
					<div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
						<feature.icon class="w-8 h-8 text-primary" />
					</div>
					<h3 class="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
					<p class="text-gray-600">{feature.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Course Preview Section -->
<section class="py-20 bg-white">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-16">
			<h2 class="text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-4">
				Popular Language Courses
			</h2>
			<p class="text-xl text-gray-600">
				Start with our most loved courses designed for all skill levels
			</p>
		</div>
		
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			<!-- Sample Course Cards -->
			<div class="card-hover">
				<div class="h-48 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg mb-6 flex items-center justify-center">
					<span class="text-3xl font-serif text-white">Yorùbá</span>
				</div>
				<h3 class="text-xl font-semibold text-gray-900 mb-2">Yoruba for Beginners</h3>
				<p class="text-gray-600 mb-4">Learn the basics of Yoruba language with cultural context and proper pronunciation.</p>
				<div class="flex items-center justify-between">
					<span class="text-sm text-gray-500">12 lessons • Beginner</span>
					<a href="/courses" class="text-primary font-medium hover:text-primary/80">
						Learn More →
					</a>
				</div>
			</div>
			
			<div class="card-hover">
				<div class="h-48 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mb-6 flex items-center justify-center">
					<span class="text-3xl font-serif text-white">Igbo</span>
				</div>
				<h3 class="text-xl font-semibold text-gray-900 mb-2">Igbo Essentials</h3>
				<p class="text-gray-600 mb-4">Master Igbo fundamentals through interactive lessons and native speaker audio.</p>
				<div class="flex items-center justify-between">
					<span class="text-sm text-gray-500">15 lessons • Beginner</span>
					<a href="/courses" class="text-primary font-medium hover:text-primary/80">
						Learn More →
					</a>
				</div>
			</div>
			
			<div class="card-hover">
				<div class="h-48 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg mb-6 flex items-center justify-center">
					<span class="text-3xl font-serif text-white">Hausa</span>
				</div>
				<h3 class="text-xl font-semibold text-gray-900 mb-2">Hausa Fundamentals</h3>
				<p class="text-gray-600 mb-4">Discover the beauty of Hausa language with comprehensive lessons and exercises.</p>
				<div class="flex items-center justify-between">
					<span class="text-sm text-gray-500">18 lessons • Beginner</span>
					<a href="/courses" class="text-primary font-medium hover:text-primary/80">
						Learn More →
					</a>
				</div>
			</div>
		</div>
		
		<div class="text-center mt-12">
			<a href="/courses" class="btn-primary">
				View All Courses
			</a>
		</div>
	</div>
</section>

<!-- Testimonials Section -->
<section class="py-20 bg-neutral">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-16">
			<h2 class="text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-4">
				What Our Learners Say
			</h2>
			<p class="text-xl text-gray-600">
				Join thousands of successful language learners
			</p>
		</div>
		
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			{#each testimonials as testimonial}
				<div class="card">
					<div class="flex items-center mb-4">
						{#each Array(testimonial.rating) as _}
							<Star class="w-5 h-5 text-gold fill-current" />
						{/each}
					</div>
					<blockquote class="text-gray-700 mb-6">
						"{testimonial.content}"
					</blockquote>
					<div>
						<div class="font-semibold text-gray-900">{testimonial.name}</div>
						<div class="text-sm text-gray-600">{testimonial.role}</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="bg-primary text-white py-20">
	<div class="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
		<h2 class="text-3xl lg:text-4xl font-serif font-bold mb-6">
			Ready to Start Your Language Journey?
		</h2>
		<p class="text-xl text-white/90 mb-8">
			Join thousands of learners preserving and mastering Nigerian languages. 
			Start your free trial today!
		</p>
		<a href="/auth/register" class="btn-secondary text-lg px-8 py-4">
			Start Learning Free
		</a>
	</div>
</section>
