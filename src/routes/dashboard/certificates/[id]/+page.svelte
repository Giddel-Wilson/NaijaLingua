<script lang="ts">
	import { Award, Download, Share, Calendar, User, BookOpen } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();
	let jsPDF: any = null;

	// Load jsPDF dynamically
	onMount(async () => {
		const { jsPDF: PDF } = await import('jspdf');
		jsPDF = PDF;
	});

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

	function downloadCertificate() {
		if (!jsPDF) {
			alert('PDF generator is loading, please try again in a moment.');
			return;
		}

		try {
			// Create new PDF document
			const doc = new jsPDF({
				orientation: 'landscape',
				unit: 'mm',
				format: 'a4'
			});

			// Set clean white background
			doc.setFillColor(255, 255, 255); // Pure white
			doc.rect(0, 0, 297, 210, 'F');

			// Add elegant outer border with more padding
			doc.setLineWidth(2);
			doc.setDrawColor(184, 134, 11); // Dark gold
			doc.rect(20, 20, 257, 170, 'S');

			// Add thin inner accent border
			doc.setLineWidth(0.5);
			doc.setDrawColor(234, 179, 8); // Light gold
			doc.rect(25, 25, 247, 160, 'S');

			// HEADER SECTION - Better positioned
			// Certificate of Completion (top, centered, with more space)
			doc.setFontSize(16);
			doc.setTextColor(107, 114, 128); // Gray-500
			doc.setFont('helvetica', 'normal');
			doc.text('CERTIFICATE OF COMPLETION', 148.5, 40, { align: 'center' });

			// Add decorative line under header
			doc.setLineWidth(1);
			doc.setDrawColor(234, 179, 8);
			doc.line(100, 45, 197, 45);

			// MAIN CONTENT SECTION - Better spaced
			// Course title (large and prominent with proper spacing)
			doc.setFontSize(42);
			doc.setTextColor(17, 24, 39); // Dark text
			doc.setFont('helvetica', 'bold');
			
			const courseTitle = data.certificate.course.title;
			const titleLines = doc.splitTextToSize(courseTitle, 200);
			
			if (titleLines.length > 1) {
				doc.setFontSize(34);
				doc.text(titleLines[0], 148.5, 65, { align: 'center' });
				if (titleLines[1]) {
					doc.text(titleLines[1], 148.5, 75, { align: 'center' });
				}
			} else {
				doc.text(courseTitle, 148.5, 70, { align: 'center' });
			}

			// Language subtitle with better spacing
			doc.setFontSize(18);
			doc.setTextColor(107, 114, 128);
			doc.setFont('helvetica', 'normal');
			const subtitleY = titleLines.length > 1 ? 88 : 83;
			doc.text(`${data.certificate.course.language} Language Course`, 148.5, subtitleY, { align: 'center' });

			// Instructor line with proper spacing
			doc.setFontSize(14);
			doc.setTextColor(107, 114, 128);
			doc.setFont('helvetica', 'normal');
			const instructorY = subtitleY + 12;
			doc.text(`Instructor: ${data.certificate.course.createdBy.name}`, 148.5, instructorY, { align: 'center' });

			// STUDENT NAME SECTION - Well spaced
			doc.setFontSize(38);
			doc.setTextColor(17, 24, 39);
			doc.setFont('helvetica', 'bold');
			const nameY = instructorY + 25;
			doc.text(data.certificate.user.name, 148.5, nameY, { align: 'center' });

			// Add elegant underline for name
			doc.setLineWidth(1);
			doc.setDrawColor(234, 179, 8);
			const nameWidth = doc.getTextWidth(data.certificate.user.name);
			doc.line(148.5 - nameWidth/2 - 10, nameY + 3, 148.5 + nameWidth/2 + 10, nameY + 3);

			// DETAILS SECTION - Properly spaced three-column layout
			const detailsY = nameY + 30;
			doc.setFontSize(12);
			doc.setTextColor(107, 114, 128);
			doc.setFont('helvetica', 'normal');

			// Create boxes for better organization
			// Left box - Date
			doc.setFillColor(248, 250, 252); // Very light gray background
			doc.rect(50, detailsY - 5, 50, 20, 'F');
			doc.setDrawColor(229, 231, 235);
			doc.rect(50, detailsY - 5, 50, 20, 'S');
			
			doc.setTextColor(75, 85, 99);
			doc.text('Date:', 75, detailsY);
			doc.setFont('helvetica', 'bold');
			doc.setTextColor(17, 24, 39);
			doc.text(formatDate(data.certificate.dateIssued), 75, detailsY + 8, { align: 'center' });

			
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(58, 149, 70);
			doc.text('Score:', 148.5, detailsY, { align: 'center' });
			doc.setFont('helvetica', 'bold');
			doc.setTextColor(34, 197, 94);
			doc.setFontSize(16);
			doc.text(`${data.certificate.score}%`, 148.5, detailsY + 8, { align: 'center' });

			// Right box - Level
			doc.setFillColor(248, 250, 252);
			doc.rect(197, detailsY - 5, 50, 20, 'F');
			doc.setDrawColor(229, 231, 235);
			doc.rect(197, detailsY - 5, 50, 20, 'S');
			
			doc.setFontSize(12);
			doc.setTextColor(75, 85, 99);
			doc.setFont('helvetica', 'normal');
			doc.text('Level:', 222, detailsY, { align: 'center' });
			doc.setFont('helvetica', 'bold');
			doc.setTextColor(17, 24, 39);
			doc.text(data.certificate.course.level || 'BEGINNER', 222, detailsY + 8, { align: 'center' });

			// FOOTER SECTION - Well organized
			const footerY = detailsY + 40;

			// Logo area (left)
			doc.setFillColor(58, 149, 70);
			doc.circle(40, footerY, 10, 'F');
			doc.setFontSize(14);
			doc.setTextColor(255, 255, 255);
			doc.setFont('helvetica', 'bold');
			doc.text('NL', 40, footerY + 2, { align: 'center' });

			// Certificate authentication (center bottom)
			doc.setFontSize(8);
			doc.setTextColor(156, 163, 175);
			doc.setFont('helvetica', 'normal');
			doc.text(`Certificate ID: ${data.certificate.id.substring(0, 16)}...`, 148.5, footerY + 8, { align: 'center' });
			doc.text(`Reference: ${data.certificate.id.substring(0, 8).toUpperCase()}`, 148.5, footerY + 13, { align: 'center' });

			// Platform branding (right)
			doc.setFontSize(12);
			doc.setTextColor(107, 114, 128);
			doc.setFont('helvetica', 'bold');
			doc.text('NaijaLingua', 266, footerY - 13, { align: 'right' });
			doc.setFont('helvetica', 'normal');
			doc.setFontSize(9);
			doc.text('Learning Platform', 267, footerY - 8, { align: 'right' });

			// Verification QR placeholder (top right, smaller and better positioned)
			// doc.setFillColor(248, 250, 252);
			// doc.rect(250, 35, 15, 15, 'F');
			// doc.setDrawColor(229, 231, 235);
			// doc.rect(250, 35, 15, 15, 'S');
			// doc.setFontSize(5);
			// doc.setTextColor(107, 114, 128);
			// doc.text('Verify', 257.5, 45, { align: 'center' });

			// Save the PDF
			const fileName = `${data.certificate.course.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}_Certificate.pdf`;
			doc.save(fileName);

			console.log('Well-arranged certificate PDF generated:', fileName);

		} catch (error) {
			console.error('Error generating PDF:', error);
			alert('Error generating certificate PDF. Please try again.');
		}
	}

	async function shareCertificate() {
		if (navigator.share) {
			try {
				await navigator.share({
					title: `Certificate - ${data.certificate.course.title}`,
					text: `I completed the ${data.certificate.course.title} course on NaijaLingua with a score of ${data.certificate.score}%!`,
					url: window.location.href
				});
			} catch (error) {
				console.log('Share cancelled');
			}
		} else {
			// Fallback: copy to clipboard
			const text = `I completed the ${data.certificate.course.title} course on NaijaLingua with a score of ${data.certificate.score}%! ${window.location.href}`;
			navigator.clipboard.writeText(text);
			alert('Certificate link copied to clipboard!');
		}
	}
</script>

<svelte:head>
	<title>Certificate - {data.certificate.course.title} - NaijaLingua</title>
</svelte:head>

<div class="max-w-4xl mx-auto p-6">
	<!-- Certificate Card -->
	<div class="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
		<!-- Certificate Header -->
		<div class="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 px-8 py-6 text-center text-white">
			<div class="mb-4">
				<div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
					<Award class="h-10 w-10 text-white" />
				</div>
				<h1 class="text-3xl font-bold mb-2">CERTIFICATE OF COMPLETION</h1>
				<div class="w-24 h-1 bg-white mx-auto rounded-full"></div>
			</div>
		</div>

		<!-- Certificate Content -->
		<div class="px-8 py-12">
			<div class="text-center mb-8">
				<p class="text-lg text-gray-600 mb-4">This is to certify that</p>
				<h2 class="text-4xl font-bold text-gray-900 mb-4">{data.certificate.user.name}</h2>
				<p class="text-lg text-gray-600 mb-4">has successfully completed the course</p>
				<h3 class="text-2xl font-semibold text-green-600 mb-2">{data.certificate.course.title}</h3>
				<div class="flex items-center justify-center gap-2 text-lg text-gray-600">
					<span class="text-2xl">{getLanguageFlag(data.certificate.course.language)}</span>
					{data.certificate.course.language} Language Course
				</div>
			</div>

			<!-- Certificate Details -->
			<div class="grid md:grid-cols-3 gap-6 mb-8">
				<div class="text-center p-4 bg-gray-50 rounded-lg">
					<div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
						<Award class="h-6 w-6 text-green-600" />
					</div>
					<p class="text-sm text-gray-600 mb-1">Score Achieved</p>
					<p class="text-xl font-bold text-green-600">{data.certificate.score}%</p>
				</div>

				<div class="text-center p-4 bg-gray-50 rounded-lg">
					<div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
						<Calendar class="h-6 w-6 text-blue-600" />
					</div>
					<p class="text-sm text-gray-600 mb-1">Date Completed</p>
					<p class="text-xl font-bold text-blue-600">{formatDate(data.certificate.dateIssued)}</p>
				</div>

				<div class="text-center p-4 bg-gray-50 rounded-lg">
					<div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
						<User class="h-6 w-6 text-purple-600" />
					</div>
					<p class="text-sm text-gray-600 mb-1">Instructor</p>
					<p class="text-xl font-bold text-purple-600">{data.certificate.course.createdBy.name}</p>
				</div>
			</div>

			<!-- Signature Area -->
			<div class="text-center mb-8">
				<div class="inline-block">
					<div class="w-48 h-px bg-gray-300 mx-auto mb-2"></div>
					<p class="text-sm text-gray-600">NaijaLingua Platform</p>
					<p class="text-xs text-gray-500">Certificate ID: {data.certificate.id}</p>
				</div>
			</div>
		</div>

		<!-- Certificate Footer -->
		<div class="bg-gray-50 px-8 py-6">
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<button 
					onclick={downloadCertificate}
					class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
				>
					<Download class="h-5 w-5" />
					Download Certificate
				</button>

				<a 
					href="/dashboard/courses"
					class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
				>
					<BookOpen class="h-5 w-5" />
					View My Courses
				</a>
			</div>
		</div>
	</div>

	<!-- Course Details -->
	<div class="mt-8 bg-white border border-gray-200 rounded-xl p-6">
		<h3 class="text-xl font-semibold text-gray-900 mb-4">Course Details</h3>
		<div class="grid sm:grid-cols-2 gap-4">
			<div>
				<p class="text-sm text-gray-600 mb-1">Course Title</p>
				<p class="font-medium text-gray-900">{data.certificate.course.title}</p>
			</div>
			<div>
				<p class="text-sm text-gray-600 mb-1">Language</p>
				<p class="font-medium text-gray-900">{data.certificate.course.language}</p>
			</div>
			<div>
				<p class="text-sm text-gray-600 mb-1">Level</p>
				<p class="font-medium text-gray-900">{data.certificate.course.level}</p>
			</div>
			<div>
				<p class="text-sm text-gray-600 mb-1">Student Email</p>
				<p class="font-medium text-gray-900">{data.certificate.user.email}</p>
			</div>
		</div>
	</div>
</div>