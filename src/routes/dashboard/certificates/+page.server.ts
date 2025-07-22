import { db } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		throw new Error('User not authenticated');
	}

	try {
		// Get user's certificates with course details
		const certificates = await db.certificate.findMany({
			where: { userId: user.id },
			include: {
				course: {
					include: {
						createdBy: {
							select: {
								name: true
							}
						}
					}
				}
			},
			orderBy: { dateIssued: 'desc' }
		});

		// Get user's completed courses stats
		const completedCoursesCount = certificates.length;
		const totalScore = certificates.reduce((sum, cert) => sum + cert.score, 0);
		const averageScore = completedCoursesCount > 0 ? totalScore / completedCoursesCount : 0;

		// Get languages learned
		const languagesLearned = [...new Set(certificates.map(cert => cert.course.language))];

		// Get full user data for display
		const fullUser = await db.user.findUnique({
			where: { id: user.id },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				bio: true,
				profileImage: true,
				createdAt: true,
				suspended: true,
				banned: true
			}
		});

		return {
			certificates,
			completedCoursesCount,
			averageScore: Math.round(averageScore),
			languagesLearned,
			user: fullUser || user
		};
	} catch (error) {
		console.error('Error loading certificates:', error);
		return {
			certificates: [],
			completedCoursesCount: 0,
			averageScore: 0,
			languagesLearned: [],
			user
		};
	}
};
