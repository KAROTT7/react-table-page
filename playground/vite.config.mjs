import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import router from 'vite-plugin-react-views'

const playgroundRoot = fileURLToPath(new URL('./', import.meta.url))
const playgroundSrcRoot = fileURLToPath(new URL('./src', import.meta.url))
const rootIndexEntry = fileURLToPath(new URL('../src/index.ts', import.meta.url))

export default defineConfig({
	root: playgroundRoot,
	plugins: [react(), router()],
	build: {
		emptyOutDir: true
	},
	resolve: {
		alias: {
			'react-table-page': rootIndexEntry,
			'@': playgroundSrcRoot
		}
	},
	server: {
		port: 5173,
		open: true
	}
})
