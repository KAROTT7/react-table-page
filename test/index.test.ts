import { describe, expect, it } from 'vitest'

import TablePage, { TablePageConfig } from '../src/index'

describe('package root exports', () => {
	it('exports the default TablePage component', () => {
		expect(TablePage).toBeDefined()
	})

	it('exports the TablePageConfig provider', () => {
		expect(TablePageConfig).toBeDefined()
	})
})