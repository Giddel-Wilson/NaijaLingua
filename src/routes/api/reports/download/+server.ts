import { error } from '@sveltejs/kit';
import { db } from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	// Check admin authentication
	if (!locals.user || locals.user.role !== 'ADMIN') {
		throw error(403, 'Access denied. Admin role required.');
	}

	const reportType = url.searchParams.get('type');
	const format = url.searchParams.get('format');

	if (!reportType || !format) {
		throw error(400, 'Report type and format are required');
	}

	try {
		let data: any[] = [];
		let filename = '';

		switch (reportType) {
			case 'users':
				data = await db.user.findMany({
					select: {
						id: true,
						name: true,
						email: true,
						role: true,
						banned: true,
						suspended: true,
						createdAt: true,
						_count: {
							select: {
								courses: true,
								enrollments: true
							}
						}
					}
				});
				filename = `users_report_${new Date().toISOString().split('T')[0]}`;
				break;

			case 'courses':
				data = await db.course.findMany({
					select: {
						id: true,
						title: true,
						description: true,
						language: true,
						level: true,
						isPublished: true,
						price: true,
						createdAt: true,
						createdBy: {
							select: {
								name: true,
								email: true
							}
						},
						_count: {
							select: {
								lessons: true,
								enrollments: true
							}
						}
					}
				});
				filename = `courses_report_${new Date().toISOString().split('T')[0]}`;
				break;

			case 'enrollments':
				data = await db.enrollment.findMany({
					select: {
						id: true,
						isCompleted: true,
						completedAt: true,
						createdAt: true,
						user: {
							select: {
								name: true,
								email: true
							}
						},
						course: {
							select: {
								title: true,
								language: true,
								level: true
							}
						}
					}
				});
				filename = `enrollments_report_${new Date().toISOString().split('T')[0]}`;
				break;

			case 'performance':
				data = await db.course.findMany({
					select: {
						id: true,
						title: true,
						language: true,
						level: true,
						isPublished: true,
						createdAt: true,
						createdBy: {
							select: {
								name: true,
								email: true
							}
						},
						_count: {
							select: {
								lessons: true,
								enrollments: true
							}
						}
					},
					orderBy: {
						enrollments: {
							_count: 'desc'
						}
					}
				});
				filename = `performance_report_${new Date().toISOString().split('T')[0]}`;
				break;

			default:
				throw error(400, 'Invalid report type');
		}

		if (format === 'csv') {
			const csv = generateCSV(data);
			return new Response(csv, {
				headers: {
					'Content-Type': 'text/csv',
					'Content-Disposition': `attachment; filename="${filename}.csv"`
				}
			});
		} else if (format === 'excel') {
			// For now, return CSV with Excel MIME type
			const csv = generateCSV(data);
			return new Response(csv, {
				headers: {
					'Content-Type': 'application/vnd.ms-excel',
					'Content-Disposition': `attachment; filename="${filename}.xls"`
				}
			});
		} else if (format === 'pdf') {
			// For now, return a simple text format
			const text = generateText(data, reportType);
			return new Response(text, {
				headers: {
					'Content-Type': 'text/plain',
					'Content-Disposition': `attachment; filename="${filename}.txt"`
				}
			});
		} else {
			throw error(400, 'Invalid format');
		}
	} catch (err) {
		console.error('Error generating report:', err);
		throw error(500, 'Failed to generate report');
	}
};

function generateCSV(data: any[]): string {
	if (data.length === 0) return '';

	// Get headers from the first row, flattening nested objects
	const headers = flattenObjectKeys(data[0]);
	
	// Generate CSV content
	const csvRows = [
		headers.join(','),
		...data.map(row => {
			const flatRow = flattenObject(row);
			return headers.map(header => {
				const value = flatRow[header];
				// Escape commas and quotes in CSV
				if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
					return `"${value.replace(/"/g, '""')}"`;
				}
				return value || '';
			}).join(',');
		})
	];

	return csvRows.join('\n');
}

function generateText(data: any[], reportType: string): string {
	const title = `${reportType.toUpperCase()} REPORT - Generated on ${new Date().toLocaleString()}`;
	const separator = '='.repeat(title.length);
	
	let content = `${title}\n${separator}\n\n`;
	
	data.forEach((item, index) => {
		content += `${index + 1}. ${JSON.stringify(item, null, 2)}\n\n`;
	});
	
	return content;
}

function flattenObject(obj: any, prefix = ''): any {
	const flattened: any = {};
	
	for (const key in obj) {
		if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
			Object.assign(flattened, flattenObject(obj[key], `${prefix}${key}_`));
		} else {
			flattened[`${prefix}${key}`] = obj[key];
		}
	}
	
	return flattened;
}

function flattenObjectKeys(obj: any, prefix = ''): string[] {
	const keys: string[] = [];
	
	for (const key in obj) {
		if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
			keys.push(...flattenObjectKeys(obj[key], `${prefix}${key}_`));
		} else {
			keys.push(`${prefix}${key}`);
		}
	}
	
	return keys;
}
