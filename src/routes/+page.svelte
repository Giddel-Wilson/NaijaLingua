<script lang="ts">
	import { ArrowRight, BookOpen, Users, Award, Globe, PlayCircle, Star, Zap, Heart, Shield, TrendingUp, MessageSquare, CheckCircle, Sparkles } from 'lucide-svelte';
	import { onMount } from 'svelte';
	
	let heroAnimated = false;
	let featuresVisible = false;
	let statsCounters = { languages: 0, lessons: 0, learners: 0, completion: 0 };
	
	onMount(() => {
		setTimeout(() => heroAnimated = true, 100);
		
		// Animate stats counters
		const targets = { languages: 1, lessons: 150, learners: 5000, completion: 98 };
		const duration = 2000;
		const interval = 50;
		const steps = duration / interval;
		
		let currentStep = 0;
		const timer = setInterval(() => {
			currentStep++;
			const progress = Math.min(currentStep / steps, 1);
			const easeOut = 1 - Math.pow(1 - progress, 3);
			
			statsCounters.languages = Math.round(targets.languages * easeOut);
			statsCounters.lessons = Math.round(targets.lessons * easeOut);
			statsCounters.learners = Math.round(targets.learners * easeOut);
			statsCounters.completion = Math.round(targets.completion * easeOut);
			
			if (progress >= 1) clearInterval(timer);
		}, interval);
		
		// Features intersection observer
		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					featuresVisible = true;
				}
			});
		}, { threshold: 0.1 });
		
		const featuresSection = document.querySelector('#features-section');
		if (featuresSection) observer.observe(featuresSection);
		
		return () => {
			clearInterval(timer);
			observer.disconnect();
		};
	});
	
	const languages = [
		{ name: 'Igbo', speakers: '24M+', color: 'bg-blue-500', emoji: '🔵' }
	];
	
	const features = [
		{
			icon: Sparkles,
			title: 'AI-Powered Learning',
			description: 'Personalized lessons that adapt to your learning style and pace',
			color: 'bg-purple-100 text-purple-600'
		},
		{
			icon: PlayCircle,
			title: 'Native Audio',
			description: 'Learn pronunciation from authentic native speaker recordings',
			color: 'bg-green-100 text-green-600'
		},
		{
			icon: Users,
			title: 'Live Sessions',
			description: 'Join interactive group classes with expert instructors',
			color: 'bg-blue-100 text-blue-600'
		},
		{
			icon: Award,
			title: 'Certificates',
			description: 'Earn verified certificates to showcase your language skills',
			color: 'bg-orange-100 text-orange-600'
		},
		{
			icon: Heart,
			title: 'Cultural Context',
			description: 'Understand the rich history and traditions behind each language',
			color: 'bg-red-100 text-red-600'
		},
		{
			icon: TrendingUp,
			title: 'Progress Tracking',
			description: 'Monitor your advancement with detailed analytics and insights',
			color: 'bg-indigo-100 text-indigo-600'
		}
	];
	
	const testimonials = [
		{
			name: 'Amara Okafor',
			role: 'Heritage Learner',
			content: 'This platform made reconnecting with my Igbo roots so natural and engaging. The cultural context is amazing!',
			rating: 5,
			avatar: 'AO',
			location: 'London, UK'
		},
		{
			name: 'Chika Adebayo',
			role: 'Student',
			content: 'As a diaspora Nigerian, this platform has been invaluable in learning Igbo. The pronunciation features are excellent!',
			rating: 5,
			avatar: 'CA',
			location: 'Toronto, Canada'
		},
		{
			name: 'Obioma Nwosu',
			role: 'Language Enthusiast',
			content: 'The interactive lessons and cultural insights make learning Igbo fun and meaningful. Highly recommend!',
			rating: 5,
			avatar: 'ON',
			location: 'New York, USA'
		}
	];	const popularCourses = [
		{
			name: 'Igbo',
			title: 'Igbo for Beginners',
			description: 'Master the fundamentals of Igbo language with cultural context and proper pronunciation.',
			lessons: 15,
			duration: '8 weeks',
			level: 'Beginner',
			gradient: 'from-blue-400 via-blue-500 to-blue-600',
			students: '3.2k'
		},
		{
			name: 'Igbo',
			title: 'Intermediate Igbo',
			description: 'Advance your Igbo skills with complex grammar, idioms, and cultural expressions.',
			lessons: 20,
			duration: '10 weeks',
			level: 'Intermediate',
			gradient: 'from-emerald-400 via-emerald-500 to-emerald-600',
			students: '1.8k'
		},
		{
			name: 'Igbo',
			title: 'Advanced Igbo Culture',
			description: 'Deep dive into Igbo culture, proverbs, traditional stories, and advanced communication.',
			lessons: 25,
			duration: '12 weeks',
			level: 'Advanced',
			gradient: 'from-purple-400 via-purple-500 to-purple-600',
			students: '950'
		}
	];
</script>

<svelte:head>
	<title>NaijaLingua - Learn Igbo Language Online</title>
	<meta name="description" content="Master the Igbo language through interactive lessons, authentic audio pronunciation, and rich cultural insights. Join thousands of learners worldwide." />
</svelte:head>

<!-- Hero Section -->
<section class="relative min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-white overflow-hidden flex items-center">
	<!-- Background Pattern -->
	<div class="absolute inset-0 opacity-10">
		<div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 40px 40px;"></div>
	</div>
	
	<!-- Floating Elements -->
	<div class="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full animate-pulse"></div>
	<div class="absolute bottom-20 right-20 w-24 h-24 bg-gold/20 rounded-full animate-bounce" style="animation-delay: -1s;"></div>
	<div class="absolute top-1/3 right-10 w-16 h-16 bg-white/10 rounded-full animate-pulse" style="animation-delay: -2s;"></div>
	
	<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
			<div class="text-center lg:text-left {heroAnimated ? 'animate-in slide-in-from-left duration-1000' : 'opacity-0'}">
				<div class="inline-flex items-center px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-8 backdrop-blur-sm border border-white/20">
					<Sparkles class="w-4 h-4 mr-2 text-gold" />
					🔵 Master Igbo Language
				</div>
				
				<h1 class="text-5xl lg:text-7xl font-serif font-bold mb-6 leading-tight">
					Learn Igbo<br>
					Language
					<span class="block text-gold relative">
						the Modern Way
						<div class="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-gold to-accent rounded-full"></div>
					</span>
				</h1>
				
				<p class="text-xl lg:text-2xl text-white/90 mb-10 max-w-2xl leading-relaxed">
					Connect with your Igbo heritage through AI-powered lessons, native pronunciation, 
					and rich cultural insights. Join <strong>5,000+</strong> Igbo learners worldwide.
				</p>
				
				<div class="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mb-12">
					<a href="/auth/register" class="group bg-gradient-to-r from-accent to-accent/90 text-white text-lg px-10 py-4 rounded-xl font-bold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center">
						Start Learning Free 
						<ArrowRight class="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
					</a>
					<a href="/courses" class="border-2 border-white text-white hover:bg-white hover:text-primary text-lg px-10 py-4 rounded-xl font-semibold backdrop-blur-sm transition-all duration-300 flex items-center justify-center">
						Explore Courses
					</a>
				</div>
				
				<!-- Trust Indicators -->
				<div class="flex items-center justify-center lg:justify-start space-x-8 text-white/80">
					<div class="flex items-center">
						<CheckCircle class="w-5 h-5 mr-2 text-gold" />
						<span class="text-sm font-medium">Free to start</span>
					</div>
					<div class="flex items-center">
						<CheckCircle class="w-5 h-5 mr-2 text-gold" />
						<span class="text-sm font-medium">Native speakers</span>
					</div>
					<div class="flex items-center">
						<CheckCircle class="w-5 h-5 mr-2 text-gold" />
						<span class="text-sm font-medium">Certificates</span>
					</div>
				</div>
			</div>
			
			<div class="flex justify-center lg:justify-end {heroAnimated ? 'animate-in slide-in-from-right duration-1000 delay-300' : 'opacity-0'}">
				<div class="relative">
					<!-- Main Language Grid -->
					<div class="grid grid-cols-2 gap-6 max-w-sm">
						{#each languages as language, i}
							<div class="group card bg-white/95 backdrop-blur-sm border-white/20 text-center p-6 hover:bg-white transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer" 
								 style="animation-delay: {(i + 1) * 200}ms">
								<div class="text-4xl mb-3">{language.emoji}</div>
								<h3 class="font-bold text-gray-900 text-lg">{language.name}</h3>
								<p class="text-gray-600 text-sm font-medium">{language.speakers} speakers</p>
								<div class="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
									<span class="text-xs text-primary font-semibold">Learn now →</span>
								</div>
							</div>
						{/each}
					</div>
					
					<!-- Decorative Elements -->
					<div class="absolute -top-4 -left-4 w-12 h-12 bg-gold/30 rounded-full animate-ping"></div>
					<div class="absolute -bottom-4 -right-4 w-8 h-8 bg-white/30 rounded-full animate-pulse"></div>
				</div>
			</div>
		</div>
	</div>
	
	<!-- Scroll Indicator -->
	<div class="absolute bottom-8 left-1/2 transform -translate-x-1/2">
		<div class="flex flex-col items-center text-white/60">
			<span class="text-sm font-medium mb-2">Scroll to explore</span>
			<div class="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
				<div class="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce"></div>
			</div>
		</div>
	</div>
</section>

<!-- Stats Section -->
<section class="bg-white py-20 relative overflow-hidden">
	<div class="absolute inset-0 bg-gradient-to-r from-neutral/50 to-white"></div>
	<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-8">
			<div class="text-center group">
				<div class="relative inline-block">
					<div class="text-5xl lg:text-6xl font-bold text-primary mb-3 transform group-hover:scale-110 transition-transform">
						{statsCounters.languages}+
					</div>
					<div class="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full animate-pulse"></div>
				</div>
				<div class="text-gray-600 font-medium text-lg">Igbo Language</div>
				<div class="text-sm text-gray-500 mt-1">Focus & Mastery</div>
			</div>
			<div class="text-center group">
				<div class="relative inline-block">
					<div class="text-5xl lg:text-6xl font-bold text-primary mb-3 transform group-hover:scale-110 transition-transform">
						{statsCounters.lessons}+
					</div>
					<div class="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.5s"></div>
				</div>
				<div class="text-gray-600 font-medium text-lg">Igbo Lessons</div>
				<div class="text-sm text-gray-500 mt-1">With native audio</div>
			</div>
			<div class="text-center group">
				<div class="relative inline-block">
					<div class="text-5xl lg:text-6xl font-bold text-primary mb-3 transform group-hover:scale-110 transition-transform">
						{statsCounters.learners.toLocaleString()}+
					</div>
					<div class="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full animate-pulse" style="animation-delay: 1s"></div>
				</div>
				<div class="text-gray-600 font-medium text-lg">Igbo Learners</div>
				<div class="text-sm text-gray-500 mt-1">Global community</div>
			</div>
			<div class="text-center group">
				<div class="relative inline-block">
					<div class="text-5xl lg:text-6xl font-bold text-primary mb-3 transform group-hover:scale-110 transition-transform">
						{statsCounters.completion}%
					</div>
					<div class="absolute -top-2 -right-2 w-6 h-6 bg-gold rounded-full animate-pulse" style="animation-delay: 1.5s"></div>
				</div>
				<div class="text-gray-600 font-medium text-lg">Completion Rate</div>
				<div class="text-sm text-gray-500 mt-1">Student success</div>
			</div>
		</div>
	</div>
</section>

<!-- Features Section -->
<section id="features-section" class="py-24 bg-gradient-to-b from-neutral/30 to-white relative overflow-hidden">
	<div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
	
	<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-20">
			<div class="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold mb-6">
				<Star class="w-4 h-4 mr-2" />
				Platform Features
			</div>
			<h2 class="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6">
				Why Choose <span class="text-primary">NaijaLingua?</span>
			</h2>
			<p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
				Our platform combines cutting-edge AI technology with traditional wisdom to create 
				the most effective and culturally rich language learning experience.
			</p>
		</div>
		
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			{#each features as feature, i}
				<div class="group relative">
					<!-- Background gradient that changes on hover -->
					<div class="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl transform group-hover:scale-105 transition-all duration-300 shadow-sm group-hover:shadow-xl"></div>
					
					<div class="relative p-8 {featuresVisible ? `animate-in slide-in-from-bottom duration-700 delay-[${i * 100}ms]` : 'opacity-0'}">
						<div class="flex items-start space-x-4">
							<div class="flex-shrink-0 w-14 h-14 {feature.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
								<feature.icon class="w-7 h-7" />
							</div>
							<div class="flex-1">
								<h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
								<p class="text-gray-600 leading-relaxed">{feature.description}</p>
							</div>
						</div>
						
						<!-- Hover arrow -->
						<div class="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
							<ArrowRight class="w-5 h-5 text-primary" />
						</div>
					</div>
				</div>
			{/each}
		</div>
		
		<!-- Bottom CTA -->
		<div class="text-center mt-16">
			<div class="inline-flex items-center space-x-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
				<div class="flex items-center space-x-2">
					<Shield class="w-5 h-5 text-green-500" />
					<span class="text-sm font-medium text-gray-700">100% Free to start</span>
				</div>
				<div class="flex items-center space-x-2">
					<Heart class="w-5 h-5 text-red-500" />
					<span class="text-sm font-medium text-gray-700">Made with love for Nigeria</span>
				</div>
				<div class="flex items-center space-x-2">
					<Zap class="w-5 h-5 text-yellow-500" />
					<span class="text-sm font-medium text-gray-700">AI-powered learning</span>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Course Preview Section -->
<section class="py-24 bg-white relative">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-20">
			<div class="inline-flex items-center px-4 py-2 bg-gold/10 rounded-full text-gold font-semibold mb-6">
				<BookOpen class="w-4 h-4 mr-2" />
				Popular Courses
			</div>
			<h2 class="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6">
				Start Your <span class="text-primary">Language Journey</span>
			</h2>
			<p class="text-xl text-gray-600 max-w-2xl mx-auto">
				Choose from our most loved courses, designed by native speakers and language experts
			</p>
		</div>
		
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
			{#each popularCourses as course, i}
				<div class="group relative transform hover:scale-105 transition-all duration-500">
					<!-- Course Card -->
					<div class="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100">
						<!-- Course Header with Gradient -->
						<div class="relative h-52 bg-gradient-to-br {course.gradient} flex items-center justify-center overflow-hidden">
							<div class="absolute inset-0 bg-black/10"></div>
							<div class="relative text-center">
								<h3 class="text-4xl font-serif font-bold text-white mb-2">{course.name}</h3>
								<div class="flex items-center justify-center space-x-4 text-white/80">
									<span class="text-sm font-medium">{course.students} students</span>
									<span class="w-1 h-1 bg-white/60 rounded-full"></span>
									<span class="text-sm font-medium">{course.duration}</span>
								</div>
							</div>
							
							<!-- Floating Elements -->
							<div class="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full animate-pulse"></div>
							<div class="absolute bottom-4 left-4 w-6 h-6 bg-white/15 rounded-full animate-bounce" style="animation-delay: -0.5s"></div>
						</div>
						
						<!-- Course Content -->
						<div class="p-8">
							<div class="flex items-center justify-between mb-4">
								<span class="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-600">
									{course.level}
								</span>
								<div class="flex items-center text-gold">
									{#each Array(5) as _}
										<Star class="w-4 h-4 fill-current" />
									{/each}
									<span class="ml-1 text-sm font-medium text-gray-600">4.9</span>
								</div>
							</div>
							
							<h4 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">{course.title}</h4>
							<p class="text-gray-600 mb-6 leading-relaxed">{course.description}</p>
							
							<div class="flex items-center justify-between text-sm text-gray-500 mb-8">
								<div class="flex items-center">
									<BookOpen class="w-4 h-4 mr-1" />
									<span>{course.lessons} lessons</span>
								</div>
								<div class="flex items-center">
									<Users class="w-4 h-4 mr-1" />
									<span>{course.students} enrolled</span>
								</div>
							</div>
							
							<div class="flex items-center justify-between">
								<div class="flex items-center space-x-2">
									<span class="text-2xl font-bold text-primary">Free</span>
									<span class="text-sm text-gray-500 line-through">$99</span>
								</div>
								<a href="/courses" class="group/btn bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary/90 hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center">
									Start Learning
									<ArrowRight class="ml-1.5 w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
								</a>
							</div>
						</div>
					</div>
					
					<!-- Course Number Badge -->
					<div class="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-gold to-accent rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
						{i + 1}
					</div>
				</div>
			{/each}
		</div>
		
		<!-- View All Courses CTA -->
		<div class="text-center mt-20">
			<div class="relative inline-block">
				<!-- Background decoration -->
				<div class="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-3xl transform -rotate-1"></div>
				<div class="relative bg-white rounded-3xl p-12 shadow-xl border border-gray-100">
					<div class="mb-8">
						<div class="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold mb-4">
							<BookOpen class="w-4 h-4 mr-2" />
							Explore All Languages
						</div>
						<h3 class="text-3xl font-serif font-bold text-gray-900 mb-4">
							Ready to Dive Deeper?
						</h3>
						<p class="text-gray-600 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
							Master Igbo language with structured learning paths from beginner to advanced levels
						</p>
					</div>
					
					<div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
						<a href="/courses" class="group bg-gradient-to-r from-primary to-primary/90 text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center">
							View All Courses
							<ArrowRight class="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
						</a>
						<a href="/auth/register" class="group border-2 border-primary text-primary px-10 py-4 rounded-xl font-semibold text-lg hover:bg-primary hover:text-white transition-all duration-300 flex items-center">
							Start Free Trial
							<Sparkles class="ml-2 w-5 h-5" />
						</a>
					</div>
					
					<!-- Quick stats -->
					<div class="flex items-center justify-center space-x-8 text-sm text-gray-500">
						<div class="flex items-center">
							<div class="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
							<span>10+ Languages</span>
						</div>
						<div class="flex items-center">
							<div class="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
							<span>500+ Lessons</span>
						</div>
						<div class="flex items-center">
							<div class="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
							<span>All Skill Levels</span>
						</div>
						<div class="flex items-center">
							<div class="w-2 h-2 bg-gold rounded-full mr-2"></div>
							<span>Native Speakers</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Testimonials Section -->
<section class="py-24 bg-gradient-to-br from-neutral/40 via-white to-neutral/40 relative overflow-hidden">
	<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
	
	<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-20">
			<div class="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold mb-6">
				<MessageSquare class="w-4 h-4 mr-2" />
				Success Stories
			</div>
			<h2 class="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6">
				What Our <span class="text-primary">Learners Say</span>
			</h2>
			<p class="text-xl text-gray-600 max-w-2xl mx-auto">
				Join thousands of successful language learners who've discovered their heritage through NaijaLingua
			</p>
		</div>
		
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			{#each testimonials as testimonial, i}
				<div class="group relative">
					<!-- Quote background -->
					<div class="absolute -top-4 -left-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
						<span class="text-2xl text-primary">"</span>
					</div>
					
					<div class="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative">
						<!-- Rating Stars -->
						<div class="flex items-center mb-6">
							{#each Array(testimonial.rating) as _}
								<Star class="w-5 h-5 text-gold fill-current" />
							{/each}
							<span class="ml-2 text-sm font-medium text-gray-600">5.0</span>
						</div>
						
						<!-- Testimonial Content -->
						<blockquote class="text-gray-700 mb-8 leading-relaxed text-lg italic">
							"{testimonial.content}"
						</blockquote>
						
						<!-- Author Info -->
						<div class="flex items-center">
							<div class="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-bold text-lg">
								{testimonial.avatar}
							</div>
							<div class="ml-4">
								<div class="font-bold text-gray-900 text-lg">{testimonial.name}</div>
								<div class="text-sm text-gray-600">{testimonial.role}</div>
								<div class="text-xs text-gray-500 flex items-center mt-1">
									<Globe class="w-3 h-3 mr-1" />
									{testimonial.location}
								</div>
							</div>
						</div>
						
						<!-- Hover Effect -->
						<div class="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500"></div>
					</div>
				</div>
			{/each}
		</div>
		
		<!-- Social Proof -->
		<div class="text-center mt-16">
			<div class="inline-flex items-center space-x-8 p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50">
				<div class="flex items-center space-x-2">
					<div class="flex -space-x-2">
						{#each Array(5) as _, i}
							<div class="w-10 h-10 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">
								{String.fromCharCode(65 + i)}
							</div>
						{/each}
					</div>
					<span class="text-sm font-medium text-gray-700">1000+ happy learners</span>
				</div>
				<div class="flex items-center space-x-1">
					{#each Array(5) as _}
						<Star class="w-5 h-5 text-gold fill-current" />
					{/each}
					<span class="ml-2 text-sm font-bold text-gray-700">4.9/5 average rating</span>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="relative bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-white py-24 overflow-hidden">
	<!-- Background Pattern -->
	<div class="absolute inset-0 opacity-10">
		<div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 50px 50px;"></div>
	</div>
	
	<!-- Floating Elements -->
	<div class="absolute top-16 left-16 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
	<div class="absolute bottom-16 right-20 w-16 h-16 bg-gold/30 rounded-full animate-bounce"></div>
	<div class="absolute top-1/3 right-16 w-12 h-12 bg-white/5 rounded-full animate-pulse" style="animation-delay: -1s;"></div>
	
	<div class="relative max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8">
		<!-- Main CTA Content -->
		<div class="mb-12">
			<div class="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-white/90 font-medium mb-8 backdrop-blur-sm">
				<Sparkles class="w-4 h-4 mr-2 text-gold" />
				Start Your Journey Today
			</div>
			
			<h2 class="text-4xl lg:text-6xl font-serif font-bold mb-8 leading-tight">
				Ready to Connect with<br>
				<span class="text-gold">Your Heritage?</span>
			</h2>
			
			<p class="text-xl lg:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
				Join over <strong>5,000 learners</strong> worldwide who are preserving and mastering Igbo language. 
				Start your free journey today and connect with your heritage.
			</p>
		</div>
		
		<!-- CTA Buttons -->
		<div class="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
			<a href="/auth/register" class="group bg-white text-primary text-xl px-12 py-5 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 flex items-center relative overflow-hidden">
				<div class="absolute inset-0 bg-gradient-to-r from-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
				<span class="relative z-10">Start Learning Free</span>
				<ArrowRight class="relative z-10 ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
			</a>
			<a href="/courses" class="group border-2 border-white text-white hover:bg-white hover:text-primary text-xl px-10 py-5 rounded-2xl font-semibold backdrop-blur-sm transition-all duration-300 flex items-center">
				Browse Courses
				<BookOpen class="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
			</a>
		</div>
		
		<!-- Trust Indicators -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
			<div class="flex items-center justify-center space-x-3">
				<div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
					<CheckCircle class="w-6 h-6 text-gold" />
				</div>
				<div class="text-left">
					<div class="font-bold text-lg">Free Forever</div>
					<div class="text-white/80 text-sm">No hidden costs or subscriptions</div>
				</div>
			</div>
			<div class="flex items-center justify-center space-x-3">
				<div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
					<Users class="w-6 h-6 text-gold" />
				</div>
				<div class="text-left">
					<div class="font-bold text-lg">Native Speakers</div>
					<div class="text-white/80 text-sm">Authentic pronunciation & culture</div>
				</div>
			</div>
			<div class="flex items-center justify-center space-x-3">
				<div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
					<Award class="w-6 h-6 text-gold" />
				</div>
				<div class="text-left">
					<div class="font-bold text-lg">Certificates</div>
					<div class="text-white/80 text-sm">Verify your language skills</div>
				</div>
			</div>
		</div>
		
		<!-- Bottom Message -->
		<div class="mt-16 pt-8 border-t border-white/20">
			<p class="text-white/70 text-lg">
				🔵 Preserving Igbo language and culture for future generations • Made with ❤️ for the diaspora
			</p>
		</div>
	</div>
</section>
