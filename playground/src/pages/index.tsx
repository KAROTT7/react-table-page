import { useMemo, useState } from 'react'
import { Input, Tag } from 'antd'
import TablePage, { TablePageConfig, type TableColumn } from 'react-table-page'

type Status = 'enabled' | 'disabled'

interface DemoRecord {
	id: number
	name: string
	status: Status
	age: number
	city: string
	createdAt: string
}

interface QueryState {
	currentPage?: number
	pageSize?: number
	name?: string
	status?: string
	statuses?: string
	citySelect?: string
	createdOn?: string
	keyword?: string
	cityKeyword?: string
	ageStart?: string
	ageEnd?: string
	createdAtStart?: string
	createdAtEnd?: string
	sortName?: string
	sortOrder?: string
}

const defaultQueryState: QueryState = {
	currentPage: 1,
	pageSize: 50,
	name: undefined,
	status: undefined,
	statuses: undefined,
	citySelect: undefined,
	createdOn: undefined,
	keyword: undefined,
	cityKeyword: undefined,
	ageStart: undefined,
	ageEnd: undefined,
	createdAtStart: undefined,
	createdAtEnd: undefined,
	sortName: undefined,
	sortOrder: undefined
}

const firstNames = ['Liam', 'Emma', 'Noah', 'Olivia', 'Ethan', 'Ava', 'Lucas', 'Sophia', 'Mason', 'Mia']
const lastNames = ['Chen', 'Wu', 'Lin', 'Zhao', 'Sun', 'Gu', 'He', 'Xu', 'Qian', 'Tang']
const cities = [
	'Shanghai',
	'Hangzhou',
	'Beijing',
	'Shenzhen',
	'Suzhou',
	'Nanjing',
	'Chengdu',
	'Wuhan',
	'Ningbo',
	'Tianjin'
]

const mockData: DemoRecord[] = Array.from({ length: 500 }, (_, index) => {
	const id = index + 1
	const month = String((index % 12) + 1).padStart(2, '0')
	const day = String((index % 28) + 1).padStart(2, '0')
	const hour = String((8 + index) % 24).padStart(2, '0')
	const minute = String((11 + index * 7) % 60).padStart(2, '0')
	const second = String((5 + index * 13) % 60).padStart(2, '0')

	return {
		id,
		name: `${firstNames[index % firstNames.length]} ${lastNames[index % lastNames.length]}`,
		status: index % 3 === 0 ? 'disabled' : 'enabled',
		age: 22 + (index % 23),
		city: cities[index % cities.length],
		createdAt: `2026-${month}-${day} ${hour}:${minute}:${second}`
	}
})

function sortRows(rows: DemoRecord[], query: QueryState) {
	if (!query.sortName || !query.sortOrder) {
		return rows
	}

	const direction = query.sortOrder === 'ascend' ? 1 : -1
	return [...rows].sort((left, right) => {
		const leftValue = left[query.sortName as keyof DemoRecord]
		const rightValue = right[query.sortName as keyof DemoRecord]

		if (leftValue === rightValue) {
			return 0
		}

		return leftValue > rightValue ? direction : -direction
	})
}

function filterRows(rows: DemoRecord[], query: QueryState) {
	return rows.filter(row => {
		const statusList = query.statuses?.split(',').filter(Boolean)

		if (query.name && !row.name.toLowerCase().includes(query.name.toLowerCase())) {
			return false
		}

		if (query.keyword) {
			const keyword = query.keyword.toLowerCase()
			const haystack = [row.name, row.city, row.status, row.createdAt].join(' ').toLowerCase()

			if (!haystack.includes(keyword)) {
				return false
			}
		}

		if (query.cityKeyword && !row.city.toLowerCase().includes(query.cityKeyword.toLowerCase())) {
			return false
		}

		if (query.status && row.status !== query.status) {
			return false
		}

		if (statusList?.length && !statusList.includes(row.status)) {
			return false
		}

		if (query.citySelect && row.city !== query.citySelect) {
			return false
		}

		if (query.createdOn && !row.createdAt.startsWith(query.createdOn)) {
			return false
		}

		if (query.ageStart && row.age < Number(query.ageStart)) {
			return false
		}

		if (query.ageEnd && row.age > Number(query.ageEnd)) {
			return false
		}

		if (query.createdAtStart && row.createdAt < query.createdAtStart) {
			return false
		}

		if (query.createdAtEnd && row.createdAt > query.createdAtEnd) {
			return false
		}

		return true
	})
}

export function Component() {
	const [queryState, setQueryState] = useState<QueryState>(defaultQueryState)

	const columns = useMemo<TableColumn<DemoRecord>[]>(
		() => [
			{
				title: 'Name',
				dataIndex: 'name',
				width: 180,
				search: {
					type: 'input',
					elementProps: {
						placeholder: 'Search by name'
					}
				}
			},
			{
				title: 'Status',
				dataIndex: 'status',
				width: 140,
				search: {
					type: 'select',
					enums: {
						enabled: 'Enabled',
						disabled: 'Disabled'
					}
				},
				render: value => <Tag color={value === 'enabled' ? 'success' : 'default'}>{value}</Tag>
			},
			{
				search: {
					type: 'select',
					name: 'statuses',
					label: 'Statuses',
					enums: {
						enabled: 'Enabled',
						disabled: 'Disabled'
					},
					elementProps: {
						mode: 'multiple',
						placeholder: 'Select multiple statuses'
					}
				}
			},
			{
				search: {
					type: 'select',
					name: 'citySelect',
					label: 'Dynamic City',
					enums: values => {
						const selectedStatuses = [values.status, ...(values.statuses || [])].filter(Boolean)
						const rows = selectedStatuses.length
							? mockData.filter(row => selectedStatuses.includes(row.status))
							: mockData

						return Array.from(new Set(rows.map(row => row.city))).map(city => ({
							label: city,
							value: city
						}))
					},
					elementProps: {
						placeholder: 'Cities react to current status filters'
					}
				}
			},
			{
				search: {
					type: 'datePicker',
					name: 'createdOn',
					label: 'Created On',
					elementProps: {
						placeholder: 'Filter by exact day'
					}
				}
			},
			{
				search: {
					type: 'textarea',
					name: 'keyword',
					label: 'Keyword',
					elementProps: {
						placeholder: 'Search name, city, status, created time',
						autoSize: {
							minRows: 1,
							maxRows: 3
						}
					}
				}
			},
			{
				title: 'Age',
				dataIndex: 'age',
				width: 120,
				sorter: true,
				search: {
					type: 'rangeInput',
					postArgs: ['ageStart', 'ageEnd']
				}
			},
			{
				title: 'City',
				dataIndex: 'city',
				width: 160
			},
			{
				search: {
					type: 'custom',
					name: 'cityKeyword',
					label: 'Custom City',
					element: <Input allowClear placeholder="Custom element: city contains" />
				}
			},
			{
				title: 'Created At',
				dataIndex: 'createdAt',
				width: 220,
				sorter: true,
				search: {
					type: 'rangePicker',
					postArgs: ['createdAtStart', 'createdAtEnd']
				}
			}
		],
		[]
	)

	const tableData = useMemo(() => {
		const filteredRows = sortRows(filterRows(mockData, queryState), queryState)
		const pageSize = Number(queryState.pageSize || 50)
		const current = Number(queryState.currentPage || 1)
		const start = (current - 1) * pageSize

		return {
			list: filteredRows.slice(start, start + pageSize),
			current,
			pageSize,
			total: filteredRows.length
		}
	}, [queryState])
	// console.log(tableData)
	return (
		<TablePageConfig
			searchText="Search"
			clearText="Reset"
			enableFormCollapse
			labelPlacement="absolute"
			rangePickerPlaceholder={['Start Date', 'End Date']}
		>
			<TablePage
				columns={columns}
				tableData={tableData}
				onChange={query => {
					setQueryState({
						...defaultQueryState,
						...(query as QueryState)
					})
				}}
				tableProps={{
					pagination: {
						position: ['bottomRight'],
						defaultPageSize: 50
					}
				}}
			/>
		</TablePageConfig>
	)
}

