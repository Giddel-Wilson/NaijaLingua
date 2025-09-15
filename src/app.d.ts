// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: {
				id: string;
				name: string;
				email: string;
				role: string;
				suspended: boolean;
				banned: boolean;
				bio?: string | null;
				profileImage?: string | null;
				createdAt: Date;
				updatedAt: Date;
			};
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
