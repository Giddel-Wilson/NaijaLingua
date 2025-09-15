import type { PageServerLoad } from './$types';

export type PageData = {
	course: {
		id: string;
		title: string;
		description: string | null;
	};
	lesson: {
		id: string;
		title: string;
		description: string | null;
		courseId: string;
	};
	quizzes: Array<{
		id: string;
		type: string;
		question: string;
		options: any;
		correctAnswer: string;
		explanation: string | null;
		points: number;
		order: number;
		createdAt: Date;
		updatedAt: Date;
	}>;
};
