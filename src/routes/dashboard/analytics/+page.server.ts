import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { verifyToken } from '$lib/auth';
import { db } from '$lib/db';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(302, '/auth/login');
    }
    
    if (locals.user.role !== 'INSTRUCTOR' && locals.user.role !== 'ADMIN') {
        throw redirect(302, '/dashboard');
    }
    
    try {
        
        // Get instructor's courses with enrollment stats
        const courses = await db.course.findMany({
            where: {
                createdById: locals.user.id
            },
            include: {
                enrollments: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                lessons: {
                    select: {
                        id: true,
                        title: true,
                        contentSource: true
                    }
                },
                certificates: true,
                _count: {
                    select: {
                        enrollments: true,
                        lessons: true
                    }
                }
            }
        });
        
        // Calculate analytics
        const totalEnrollments = courses.reduce((sum, course) => sum + course._count.enrollments, 0);
        const totalCertificates = courses.reduce((sum, course) => sum + course.certificates.length, 0);
        const completionRate = totalEnrollments > 0 ? (totalCertificates / totalEnrollments) * 100 : 0;
        
        // Language distribution
        const languageStats = courses.reduce((acc, course) => {
            const lang = course.language;
            if (!acc[lang]) {
                acc[lang] = { enrollments: 0, courses: 0, completions: 0 };
            }
            acc[lang].courses++;
            acc[lang].enrollments += course._count.enrollments;
            acc[lang].completions += course.certificates.length;
            return acc;
        }, {} as Record<string, any>);
        
        // AI Content Source Analytics
        const contentSourceStats = courses.reduce((acc, course) => {
            course.lessons.forEach(lesson => {
                const source = lesson.contentSource || 'Manual';
                if (!acc[source]) {
                    acc[source] = 0;
                }
                acc[source]++;
            });
            return acc;
        }, {} as Record<string, number>);
        
        // Recent activity
        const recentEnrollments = courses
            .flatMap(course => 
                course.enrollments.map(enrollment => ({
                    ...enrollment,
                    courseName: course.title,
                    courseLanguage: course.language
                }))
            )
            .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
            .slice(0, 10);
        
        // Student progress analytics
        const studentProgress = courses.map(course => {
            const avgProgress = course.enrollments.length > 0 
                ? course.enrollments.reduce((sum, e) => sum + e.progress, 0) / course.enrollments.length
                : 0;
            
            return {
                courseId: course.id,
                title: course.title,
                language: course.language,
                level: course.level,
                enrollments: course._count.enrollments,
                avgProgress: Math.round(avgProgress),
                completions: course.certificates.length,
                completionRate: course._count.enrollments > 0 
                    ? Math.round((course.certificates.length / course._count.enrollments) * 100)
                    : 0,
                hasAIContent: course.lessons.some(l => l.contentSource && l.contentSource !== 'Manual')
            };
        });
        
        return {
            user: locals.user,
            courses: studentProgress,
            analytics: {
                totalCourses: courses.length,
                totalEnrollments,
                totalCertificates,
                completionRate: Math.round(completionRate),
                languageStats,
                contentSourceStats,
                recentEnrollments
            }
        };
    } catch (error) {
        throw redirect(302, '/auth/login');
    }
};
