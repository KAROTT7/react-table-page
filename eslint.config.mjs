import js from '@eslint/js'
import globals from 'globals'
import prettierConfig from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

export default tseslint.config(
	{
		ignores: ['**/dist/**', 'node_modules/**']
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	prettierConfig,
	{
		files: ['**/*.{js,mjs,cjs,ts,tsx}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.node
			}
		},
		rules: {
			'@typescript-eslint/no-explicit-any': 'off'
		}
	},
	{
		files: ['test/**/*.ts'],
		languageOptions: {
			globals: {
				...globals.node
			}
		}
	}
)

