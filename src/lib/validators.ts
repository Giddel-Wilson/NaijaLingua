import { z } from 'zod';

// User validation schemas
export const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
	confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords don't match",
	path: ['confirmPassword']
});

// Course validation schemas
export const courseSchema = z.object({
	title: z.string().min(1, 'Course title is required'),
	description: z.string().optional(),
	language: z.enum(['YORUBA', 'IGBO', 'HAUSA', 'EFIK', 'TIV', 'FULFULDE', 'KANURI', 'IBIBIO', 'EDO', 'IJAW']),
	level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
	imageUrl: z.string().url().optional().or(z.literal(''))
});

// Lesson validation schemas
export const lessonSchema = z.object({
	title: z.string().min(1, 'Lesson title is required'),
	contentHtml: z.string().optional(),
	audioUrl: z.string().url().optional().or(z.literal('')),
	imageUrl: z.string().url().optional().or(z.literal('')),
	order: z.number().int().positive()
});

// Quiz validation schemas
export const quizSchema = z.object({
	type: z.enum(['MCQ', 'DRAG_DROP', 'AUDIO_MATCH', 'VOICE_MATCH']),
	question: z.string().min(1, 'Question is required'),
	options: z.array(z.string()).min(2, 'At least 2 options required'),
	correctAnswer: z.string().min(1, 'Correct answer is required'),
	explanation: z.string().optional(),
	order: z.number().int().positive()
});

// Type exports
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type CourseData = z.infer<typeof courseSchema>;
export type LessonData = z.infer<typeof lessonSchema>;
export type QuizData = z.infer<typeof quizSchema>;
