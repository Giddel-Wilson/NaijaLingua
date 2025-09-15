import { db } from '$lib/db';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, locals }) => {
	const user = locals.user;
	if (!user) {
		throw error(401, 'Unauthorized');
	}

	const lessonId = params.id;

	try {
		// Mark lesson as completed
		await db.lessonProgress.updateMany({
			where: {
				userId: user.id,
				lessonId: lessonId
			},
			data: {
				completed: true,
				completedAt: new Date()
			}
		});

		// Update enrollment progress
		const lesson = await db.lesson.findUnique({
			where: { id: lessonId },
			include: {
				course: {
					include: {
						lessons: {
							where: { isPublished: true }
						}
					}
				}
			}
		});

		if (lesson) {
			const completedLessons = await db.lessonProgress.count({
				where: {
					userId: user.id,
					completed: true,
					lesson: {
						courseId: lesson.courseId
					}
				}
			});

			const totalLessons = lesson.course.lessons.length;
			const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

			await db.enrollment.updateMany({
				where: {
					userId: user.id,
					courseId: lesson.courseId
				},
				data: {
					progress: progress
				}
			});

			// If course is completed, create certificate
			if (progress === 100) {
				const existingCertificate = await db.certificate.findFirst({
					where: {
						userId: user.id,
						courseId: lesson.courseId
					}
				});

				if (!existingCertificate) {
					await db.certificate.create({
						data: {
							userId: user.id,
							courseId: lesson.courseId,
							score: 100, // Default score for completion
							dateIssued: new Date()
						}
					});
				}
			}
		}

		return json({ success: true });
	} catch (err) {
		console.error('Error completing lesson:', err);
		throw error(500, 'Failed to complete lesson');
	}
};
