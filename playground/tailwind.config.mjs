/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', '../src/component/**/*.{ts,tsx}'],
	theme: {
		extend: {
			colors: {
				ink: '#1f2937',
				mist: '#475467'
			},
			boxShadow: {
				panel: '0 20px 50px rgba(15, 23, 42, 0.08)'
			}
		}
	},
	plugins: []
}