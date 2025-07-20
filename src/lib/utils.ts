import type { Language, Level } from '@prisma/client';

export function formatLanguage(language: Language): string {
	const languageMap: Record<Language, string> = {
		YORUBA: 'Yoruba',
		IGBO: 'Igbo',
		HAUSA: 'Hausa',
		EFIK: 'Efik',
		TIV: 'Tiv',
		FULFULDE: 'Fulfulde',
		KANURI: 'Kanuri',
		IBIBIO: 'Ibibio',
		EDO: 'Edo',
		IJAW: 'Ijaw'
	};
	return languageMap[language] || language;
}

export function formatLevel(level: Level): string {
	return level.charAt(0) + level.slice(1).toLowerCase();
}

export function calculateProgress(completed: number, total: number): number {
	if (total === 0) return 0;
	return Math.round((completed / total) * 100);
}

export function formatProgress(progress: number): string {
	return `${Math.round(progress)}%`;
}

export function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength) + '...';
}

export function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export function formatDate(date: Date): string {
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	}).format(date);
}

export function formatDateTime(date: Date): string {
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).format(date);
}

export function generateCertificateId(): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let result = 'NL-';
	for (let i = 0; i < 8; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}
