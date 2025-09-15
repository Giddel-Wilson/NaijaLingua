import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				primary: '#10b981', // emerald-500
				'primary-dark': '#059669', // emerald-600
			}
		}
	}
} satisfies Config;
