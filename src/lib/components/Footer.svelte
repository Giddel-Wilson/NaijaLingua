<script lang="ts">
	import { BookOpen, Mail, Phone, MapPin } from 'lucide-svelte';
</script>

<footer class="bg-primary text-white">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-8">
			<!-- Brand -->
			<div class="col-span-1 md:col-span-2">
				<div class="flex items-center space-x-2 mb-4">
					<div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
						<BookOpen class="w-5 h-5 text-white" />
					</div>
					<span class="text-xl font-serif font-bold">NaijaLingua</span>
				</div>
				<p class="text-white/80 mb-4 max-w-md">
					Preserving and teaching indigenous Nigerian languages through structured multimedia lessons, 
					assessments, and certifications.
				</p>
				<div class="flex space-x-4">
					<a href="#" class="text-white/60 hover:text-white transition-colors">
						<span class="sr-only">Facebook</span>
						<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
							<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
						</svg>
					</a>
					<a href="#" class="text-white/60 hover:text-white transition-colors">
						<span class="sr-only">Twitter</span>
						<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
							<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
						</svg>
					</a>
					<a href="#" class="text-white/60 hover:text-white transition-colors">
						<span class="sr-only">YouTube</span>
						<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
							<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
						</svg>
					</a>
				</div>
			</div>
			
			<!-- Quick Links -->
			<div>
				<h3 class="text-lg font-semibold mb-4">Quick Links</h3>
				<ul class="space-y-2">
					<li><a href="/courses" class="text-white/80 hover:text-white transition-colors">All Courses</a></li>
					<li><a href="/about" class="text-white/80 hover:text-white transition-colors">About Us</a></li>
					<li><a href="/contact" class="text-white/80 hover:text-white transition-colors">Contact</a></li>
					<li><a href="/help" class="text-white/80 hover:text-white transition-colors">Help Center</a></li>
					<li><a href="/terms" class="text-white/80 hover:text-white transition-colors">Terms of Service</a></li>
					<li><a href="/privacy" class="text-white/80 hover:text-white transition-colors">Privacy Policy</a></li>
				</ul>
			</div>
			
			<!-- Contact -->
			<div>
				<h3 class="text-lg font-semibold mb-4">Contact Us</h3>
				<ul class="space-y-3">
					<li class="flex items-center space-x-2">
						<Mail class="w-4 h-4 text-white/60" />
						<span class="text-white/80">info@naijalingua.com</span>
					</li>
					<li class="flex items-center space-x-2">
						<Phone class="w-4 h-4 text-white/60" />
						<span class="text-white/80">+234 800 NAIJA LINGUA</span>
					</li>
					<li class="flex items-start space-x-2">
						<MapPin class="w-4 h-4 text-white/60 mt-0.5" />
						<span class="text-white/80">Lagos, Nigeria</span>
					</li>
				</ul>
			</div>
		</div>
		
		<div class="border-t border-white/20 pt-8 mt-8">
			<div class="flex flex-col md:flex-row justify-between items-center">
				<p class="text-white/60 text-sm">
					© 2025 NaijaLingua. All rights reserved.
				</p>
				<p class="text-white/60 text-sm mt-2 md:mt-0">
					Preserving Nigerian Heritage Through Language
				</p>
			</div>
		</div>
	</div>
</footer>
