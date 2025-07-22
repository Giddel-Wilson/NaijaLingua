<script lang="ts">
	import { Award, Download, Star, Calendar, Trophy, Languages } from 'lucide-svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
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
			TIV: '🟤'
		};
		return flags[language] || '🌍';
	}

	function getScoreGrade(score: number) {
		if (score >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100' };
		if (score >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
		if (score >= 70) return { grade: 'B+', color: 'text-blue-600', bg: 'bg-blue-100' };
		if (score >= 60) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
		if (score >= 50) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
		return { grade: 'D', color: 'text-red-600', bg: 'bg-red-100' };
	}

	function downloadCertificate(certificate: any) {
		// Generate certificate as PDF (placeholder for now)
		const certificateData = {
			studentName: data.user.name,
			courseName: certificate.course.title,
			language: certificate.course.language,
			score: certificate.score,
			dateIssued: certificate.dateIssued,
			instructor: certificate.course.createdBy.name
		};
		
		// For now, we'll create a simple HTML certificate and trigger download
		generateCertificatePDF(certificateData);
	}

	function generateCertificatePDF(certData: any) {
		// Create a new window with the certificate
		const certificateWindow = window.open('', '_blank');
		if (!certificateWindow) return;

		// Format the date
		const formattedDate = new Date(certData.dateIssued).toLocaleDateString('en-US', { 
			year: 'numeric', 
			month: 'long', 
			day: 'numeric' 
		});

		// Create the HTML content using DOM methods to avoid template literal issues
		const html = document.createElement('html');
		const head = document.createElement('head');
		const body = document.createElement('body');
		
		// Set title
		const title = document.createElement('title');
		title.textContent = `Certificate - ${certData.courseName}`;
		head.appendChild(title);
		
		// Create styles
		const style = document.createElement('style');
		style.textContent = `
			body {
				font-family: "Georgia", serif;
				margin: 0;
				padding: 40px;
				background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
				min-height: 100vh;
				display: flex;
				align-items: center;
				justify-content: center;
			}
			.certificate {
				background: white;
				padding: 60px;
				border: 10px solid #d4af37;
				border-radius: 20px;
				text-align: center;
				box-shadow: 0 20px 40px rgba(0,0,0,0.1);
				max-width: 800px;
				position: relative;
			}
			.certificate::before {
				content: "";
				position: absolute;
				top: 20px;
				left: 20px;
				right: 20px;
				bottom: 20px;
				border: 2px solid #d4af37;
				border-radius: 10px;
			}
			.header { color: #22c55e; margin-bottom: 40px; }
			.title { font-size: 48px; font-weight: bold; margin-bottom: 20px; color: #22c55e; }
			.subtitle { font-size: 24px; color: #666; margin-bottom: 40px; }
			.student-name { font-size: 36px; color: #1f2937; margin: 30px 0; font-weight: bold; border-bottom: 2px solid #d4af37; padding-bottom: 10px; display: inline-block; }
			.course-info { font-size: 24px; color: #374151; margin: 30px 0; }
			.details { display: flex; justify-content: space-between; margin-top: 60px; font-size: 16px; color: #666; }
			.seal { position: absolute; top: 40px; right: 40px; width: 80px; height: 80px; background: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; }
			@media print { body { background: white; } .certificate { box-shadow: none; } }
		`;
		head.appendChild(style);
		
		// Create certificate content
		const certificateDiv = document.createElement('div');
		certificateDiv.className = 'certificate';
		
		certificateDiv.innerHTML = `
			<div class="seal">CERTIFIED</div>
			<div class="header">
				<div style="font-size: 20px; font-weight: bold;">NAIJALINGUA</div>
				<div style="font-size: 14px;">Nigerian Languages Learning Platform</div>
			</div>
			<div class="title">Certificate of Completion</div>
			<div class="subtitle">This is to certify that</div>
			<div class="student-name">${certData.studentName}</div>
			<div style="font-size: 20px; margin: 20px 0;">has successfully completed the course</div>
			<div class="course-info">
				<strong>${certData.courseName}</strong><br>
				<span style="font-size: 18px; color: #666;">${certData.language} Language Course</span>
			</div>
			<div style="font-size: 18px; margin: 30px 0;">
				with a score of <strong style="color: #22c55e;">${certData.score}%</strong>
			</div>
			<div class="details">
				<div>
					<strong>Date Issued:</strong><br>
					${formattedDate}
				</div>
				<div>
					<strong>Instructor:</strong><br>
					${certData.instructor}
				</div>
				<div>
					<strong>Certificate ID:</strong><br>
					NL-CERT123
				</div>
			</div>
		`;
		
		body.appendChild(certificateDiv);
		
		// Add print script
		const script = document.createElement('script');
		script.textContent = 'window.onload = function() { window.print(); }';
		body.appendChild(script);
		
		html.appendChild(head);
		html.appendChild(body);
		
		// Write to new window
		certificateWindow.document.write('<!DOCTYPE html>' + html.outerHTML);
		certificateWindow.document.close();
	}
</script>

<svelte:head>
	<title>My Certificates - NaijaLingua</title>
</svelte:head>

<div class="p-6">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-2">My Certificates</h1>
		<p class="text-gray-600">
			Your achievements and completed courses
		</p>
	</div>

	<!-- Stats Overview -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
		<div class="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-yellow-100 text-sm">Total Certificates</p>
					<p class="text-2xl font-bold">{data.completedCoursesCount}</p>
				</div>
				<Award class="h-8 w-8 text-yellow-200" />
			</div>
		</div>

		<div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-green-100 text-sm">Average Score</p>
					<p class="text-2xl font-bold">{data.averageScore}%</p>
				</div>
				<Star class="h-8 w-8 text-green-200" />
			</div>
		</div>

		<div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-blue-100 text-sm">Languages Learned</p>
					<p class="text-2xl font-bold">{data.languagesLearned.length}</p>
				</div>
				<Languages class="h-8 w-8 text-blue-200" />
			</div>
		</div>

		<div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-purple-100 text-sm">Expertise Level</p>
					<p class="text-2xl font-bold">
						{#if data.averageScore >= 90}
							Expert
						{:else if data.averageScore >= 80}
							Advanced
						{:else if data.averageScore >= 70}
							Proficient
						{:else}
							Learner
						{/if}
					</p>
				</div>
				<Trophy class="h-8 w-8 text-purple-200" />
			</div>
		</div>
	</div>

	<!-- Languages Overview -->
	{#if data.languagesLearned.length > 0}
		<div class="mb-8">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">Languages You've Mastered</h2>
			<div class="flex flex-wrap gap-3">
				{#each data.languagesLearned as language}
					<div class="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center space-x-2">
						<span class="text-2xl">{getLanguageFlag(language)}</span>
						<span class="font-medium text-gray-900">{language}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Certificates Grid -->
	{#if data.certificates.length > 0}
		<div>
			<h2 class="text-2xl font-bold text-gray-900 mb-6">Your Certificates</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each data.certificates as certificate}
					{@const scoreInfo = getScoreGrade(certificate.score)}
					<div class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
						<!-- Certificate Header -->
						<div class="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 text-white relative">
							<div class="flex items-center justify-between">
								<Award class="h-10 w-10" />
								<div class="text-right">
									<div class="text-sm opacity-90">Certificate</div>
									<div class="text-lg font-bold">#{certificate.id.slice(-6).toUpperCase()}</div>
								</div>
							</div>
							
							<!-- Language Flag -->
							<div class="absolute top-4 left-1/2 transform -translate-x-1/2">
								<span class="text-4xl">{getLanguageFlag(certificate.course.language)}</span>
							</div>
						</div>

						<!-- Certificate Content -->
						<div class="p-6">
							<h3 class="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
								{certificate.course.title}
							</h3>
							
							<div class="mb-4">
								<span class="text-sm text-gray-600">Language: </span>
								<span class="font-medium text-gray-900">{certificate.course.language}</span>
							</div>

							<!-- Score Badge -->
							<div class="flex items-center justify-between mb-4">
								<div class="flex items-center space-x-2">
									<span class="text-sm text-gray-600">Score:</span>
									<span class={`px-3 py-1 rounded-full text-sm font-bold ${scoreInfo.bg} ${scoreInfo.color}`}>
										{certificate.score}% ({scoreInfo.grade})
									</span>
								</div>
								<div class="flex items-center text-sm text-gray-500">
									<Calendar class="h-4 w-4 mr-1" />
									{formatDate(certificate.dateIssued)}
								</div>
							</div>

							<!-- Instructor Info -->
							<div class="text-sm text-gray-600 mb-6">
								<span>Instructor: </span>
								<span class="font-medium">{certificate.course.createdBy.name}</span>
							</div>

							<!-- Actions -->
							<div class="flex space-x-3">
								<button 
									on:click={() => downloadCertificate(certificate)}
									class="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
								>
									<Download class="h-4 w-4 mr-2" />
									Download
								</button>
								<button class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
									<Star class="h-4 w-4" />
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="text-center py-16 bg-gray-50 rounded-lg">
			<Award class="h-16 w-16 text-gray-400 mx-auto mb-4" />
			<h3 class="text-xl font-semibold text-gray-900 mb-2">No certificates yet</h3>
			<p class="text-gray-600 mb-6">Complete courses to earn your first certificate!</p>
			<a 
				href="/dashboard/courses" 
				class="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 inline-flex items-center"
			>
				<Award class="h-5 w-5 mr-2" />
				View My Courses
			</a>
		</div>
	{/if}
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
