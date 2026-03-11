import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'

const extensions = ['.ts', '.tsx', '.js', '.mjs']
const external = id => /^(react|react-dom|react-router-dom|antd|dayjs|classnames|@ant-design\/icons)(\/|$)/.test(id)

export default [
	{
		input: 'src/index.ts',
		external,
		output: {
			file: 'dist/index.js',
			format: 'esm',
			sourcemap: true
		},
		plugins: [
			resolve({ extensions }),
			commonjs(),
			typescript({
				tsconfig: './tsconfig.build.json'
			}),
			terser()
		]
	},
	{
		input: 'dist/types/index.d.ts',
		external,
		output: {
			file: 'dist/index.d.ts',
			format: 'esm'
		},
		plugins: [dts()]
	}
]
