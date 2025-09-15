import { db } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		throw new Error('User not authenticated');
	}

	try {
		// Get user's enrollments with detailed progress
		const enrollments = await db.enrollment.findMany({
			where: { userId: user.id },
			include: {
				course: {
					include: {
						lessons: {
							include: {
								progress: {
									where: { userId: user.id }
								}
							}
						},
						_count: {
							select: {
								lessons: true,
								enrollments: true
							}
						}
					}
				}
			}
		});

		// Get certificates
		const certificates = await db.certificate.findMany({
			where: { userId: user.id },
			include: {
				course: {
					select: {
						title: true,
						language: true,
						level: true
					}
				}
			},
			orderBy: { dateIssued: 'desc' }
		});

		// Calculate detailed statistics
		const totalEnrollments = enrollments.length;
		const totalCertificates = certificates.length;
		const completedCourses = enrollments.filter(e => e.progress >= 100).length;
		const inProgressCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;

		// Calculate total lessons stats
		let totalLessons = 0;
		let completedLessons = 0;
		let totalTimeSpent = 0;

		enrollments.forEach(enrollment => {
			const courseLessons = enrollment.course.lessons;
			totalLessons += courseLessons.length;
			
			courseLessons.forEach(lesson => {
				const progress = lesson.progress[0]; // User's progress for this lesson
				if (progress && progress.completed) {
					completedLessons++;
					totalTimeSpent += progress.timeSpent || 0;
				}
			});
		});

		// Calculate learning streaks and recent activity
		const recentProgress = await db.lessonProgress.findMany({
			where: {
				userId: user.id,
				completedAt: {
					not: null
				}
			},
			include: {
				lesson: {
					include: {
						course: {
							select: {
								title: true,
								language: true
							}
						}
					}
				}
			},
			orderBy: { completedAt: 'desc' },
			take: 10
		});

		// Calculate languages learning (simplified for Igbo-only focus)
		const languagesLearning = ['IGBO']; // NaijaLingua focuses on Igbo
		const languagesCompleted = certificates.length > 0 ? ['IGBO'] : [];

		// Calculate learning consistency (days with activity in last 30 days)
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		
		const recentActivity = await db.lessonProgress.findMany({
			where: {
				userId: user.id,
				completedAt: {
					gte: thirtyDaysAgo
				}
			},
			select: {
				completedAt: true
			}
		});

		// Group by date to count active days
		const activeDays = new Set();
		recentActivity.forEach(activity => {
			if (activity.completedAt) {
				const date = activity.completedAt.toDateString();
				activeDays.add(date);
			}
		});

		// Simplified language stats for Igbo-only focus
		const languageStats: any[] = []; // Remove complex language stats since we only focus on Igbo

		const currentStreak = activeDays.size; // Simplified streak calculation

		return {
			// Overview stats
			totalEnrollments,
			completedCourses,
			inProgressCourses,
			totalCertificates,
			totalLessons,
			completedLessons,
			totalTimeSpent,
			currentStreak,
			activeDaysLast30: activeDays.size,

			// Learning data
			enrollments,
			certificates,
			recentProgress,
			languagesLearning,
			languagesCompleted,
			languageStats, // Empty array since we simplified this

			// Calculated metrics
			completionRate: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
			averageScore: certificates.length > 0 ? Math.round(certificates.reduce((sum, c) => sum + c.score, 0) / certificates.length) : 0
		};
	} catch (error) {
		console.error('Error loading progress:', error);
		return {
			totalEnrollments: 0,
			completedCourses: 0,
			inProgressCourses: 0,
			totalCertificates: 0,
			totalLessons: 0,
			completedLessons: 0,
			totalTimeSpent: 0,
			currentStreak: 0,
			activeDaysLast30: 0,
			enrollments: [],
			certificates: [],
			recentProgress: [],
			languagesLearning: [],
			languagesCompleted: [],
			languageStats: [],
			completionRate: 0,
			averageScore: 0
		};
	}
};