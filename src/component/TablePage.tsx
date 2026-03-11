import {
	useEffect,
	useMemo,
	useRef,
	useState,
	isValidElement,
	type RefObject,
	type PropsWithChildren,
	type ReactElement,
	type ReactNode
} from 'react'
import { Table, Row, Col } from 'antd'
import cl from 'classnames'
import SearchForm, { AntdFormProps, type FormElement, type NormalizedItem } from './SearchForm'
import type { ColumnType, TableProps } from 'antd/es/table'
import { useLocation, useSearchParams } from 'react-router-dom'
import { copyFromSearchParams, type FormToQueryObject } from './getElement'
import { type TableKeysMap, useTablePageConfig } from './context'

export interface TableColumn<T = unknown> extends ColumnType<T> {
	search?: FormElement
}

type QueryValues = Record<string, string | number>
type QueryInputValues = Record<string, unknown>

function filter(values: QueryInputValues) {
	return Object.entries(values).reduce((result, [key, value]) => {
		if (value != '' && value != null) {
			result[key] = value
		}

		return result
	}, {} as QueryInputValues)
}

function parseSummary(slot?: Summary | ReactElement | null): ReactNode {
	if (!slot) return slot

	if (isValidElement(slot)) {
		return slot
	}

	if (slot.left != null || slot.right != null) {
		return (
			<Row justify="space-between" className="mb-3">
				<Col>{slot.left}</Col>
				<Col>{slot.right}</Col>
			</Row>
		)
	}

	return null
}

interface Summary {
	left?: ReactNode
	right?: ReactNode
}

interface TablePageData<T = unknown> {
	list: T[]
	current: number
	pageSize: number
	total: number
}

type TablePageDataSource<T> = Partial<TablePageData<T>> & Record<string, unknown>

type TableAction = 'paginate' | 'filter' | 'sort' | 'search'

function normalizeNumber(value: unknown, fallback: number, min = 0) {
	const parsed = Number(value)

	if (!Number.isFinite(parsed) || parsed < min) {
		return fallback
	}

	return parsed
}

function normalizeData<T>(data: TablePageDataSource<T> = {}, map: TableKeysMap = {}): TablePageData<T> {
	const { current = 'current', pageSize = 'pageSize', total = 'total', list = 'list' } = map
	const listValue = data[list]

	return {
		current: normalizeNumber(data[current], 1, 1),
		pageSize: normalizeNumber(data[pageSize], 10, 1),
		total: normalizeNumber(data[total], 0, 0),
		list: Array.isArray(listValue) ? (listValue as T[]) : []
	}
}

interface SearchFormInstance {
	formToQueryObject: FormToQueryObject
	formWrapper: HTMLDivElement
}

interface TablePageProps<T> {
	/** 容器样式 */
	className?: string
	/** search 容器样式 */
	searchWrapperClass?: string
	/** table 容器样式 */
	tableWrapperClass?: string
	columns: TableColumn<T>[]
	/** 表格数据 */
	tableData?: TablePageDataSource<T>
	/** table props - 参考 antd table */
	tableProps?: Omit<TableProps<T>, 'columns' | 'dataSource' | 'scroll' | 'onScroll' | 'onChange'>
	/** 总结栏 */
	summary?: Summary | ReactElement
	/** 不变的 query 参数 */
	permanentQuery?: Record<string, string | string[]>
	/** 查询参数变更 */
	onChange?(v: Record<string, string | number>, action: TableAction): void
	/** 当分页变化时滚动到指定高度 */
	scrollToTop?: boolean | ((tableElement: HTMLDivElement) => number)
	/** 组件距离滚动容器顶部的高度 */
	offsetTop?: number
	/** Antd Form 属性 */
	formProps?: AntdFormProps
}

type ScrollContainer = HTMLElement | Window

function toSearchParamsInit(values: Record<string, unknown>) {
	return Object.entries(values).reduce(
		(result, [key, value]) => {
			if (value == null) {
				return result
			}

			result[key] = Array.isArray(value) ? value.map(item => String(item)) : String(value)
			return result
		},
		{} as Record<string, string | string[]>
	)
}

export default function TablePage<T = unknown>(props: PropsWithChildren<TablePageProps<T>>) {
	const {
		className,
		searchWrapperClass,
		tableWrapperClass,
		columns = [],
		tableProps = {},
		summary,
		tableData,
		permanentQuery = {},
		onChange,
		scrollToTop = true,
		offsetTop = 0,
		formProps = {}
	} = props

	const { tableConfig, tableDataMap, getContainer } = useTablePageConfig()
	const mergedTableProps = useMemo(() => {
		const resolvedTableConfig = (tableConfig || {}) as Omit<
			TableProps<T>,
			'columns' | 'dataSource' | 'onChange' | 'scroll' | 'onScroll'
		>

		const resolvedPagination = (() => {
			if (tableProps.pagination === false) {
				return false
			}

			if (resolvedTableConfig.pagination === false) {
				return tableProps.pagination ?? false
			}

			return {
				...(resolvedTableConfig.pagination || {}),
				...(tableProps.pagination || {})
			}
		})()

		return {
			...resolvedTableConfig,
			...tableProps,
			pagination: resolvedPagination
		}
	}, [tableConfig, tableProps])

	const infiniteScroll = !!mergedTableProps.virtual

	const [searchParams, setSearchParams] = useSearchParams()
	// 用于相同 searchParams 时，点击 search 刷新页面
	const location = useLocation()

	const data = normalizeData(tableData, tableDataMap)
	const tableElementRef = useRef<HTMLDivElement>(null)
	const actionRef = useRef<TableAction>('search')
	const pendingInfinitePageRef = useRef<number | null>(null)
	const pendingInfinitePageTimerRef = useRef<number | null>(null)

	function clearPendingInfinitePage() {
		pendingInfinitePageRef.current = null

		if (pendingInfinitePageTimerRef.current != null) {
			window.clearTimeout(pendingInfinitePageTimerRef.current)
			pendingInfinitePageTimerRef.current = null
		}
	}

	function markPendingInfinitePage(page: number) {
		clearPendingInfinitePage()
		pendingInfinitePageRef.current = page
		pendingInfinitePageTimerRef.current = window.setTimeout(() => {
			pendingInfinitePageRef.current = null
			pendingInfinitePageTimerRef.current = null
		}, 1500)
	}

	function getChangedParameters(searchParams: URLSearchParams, extraQuery: QueryValues = {}) {
		const defaultPageSize =
			typeof resolvedPagination === 'object' && resolvedPagination.defaultPageSize
				? resolvedPagination.defaultPageSize
				: 10

		const result: QueryValues = {
			currentPage: 1,
			pageSize: defaultPageSize
		}
		for (const [key, value] of searchParams) {
			if (key[0] === '_') {
				result[key.slice(1)] = value
			} else {
				result[key] = value
			}
		}

		return {
			...result,
			...extraQuery
		}
	}

	useEffect(() => {
		const result = getChangedParameters(searchParams)

		onChange?.(result, actionRef.current)
	}, [searchParams, location])

	useEffect(() => {
		if (!infiniteScroll && actionRef.current === 'paginate' && tableElementRef.current && scrollToTop !== false) {
			const container = getContainer?.() ?? window
			scrollToTableTop(container, tableElementRef.current, offsetTop, scrollToTop)
		}
	}, [data, getContainer, scrollToTop, infiniteScroll, offsetTop])

	useEffect(() => {
		if (!infiniteScroll) {
			clearPendingInfinitePage()
			return
		}

		if (pendingInfinitePageRef.current != null && data.current >= pendingInfinitePageRef.current) {
			clearPendingInfinitePage()
		}

		return () => {
			clearPendingInfinitePage()
		}
	}, [data.current, infiniteScroll])

	const { tableColumns, formItems, totalWidth } = useMemo(() => {
		const tableColumns: ColumnType<T>[] = []
		const formItems: NormalizedItem[] = []
		let totalWidth = 0

		columns.forEach(column => {
			const { search, ...rest } = column
			const hasColumn = rest.dataIndex != null || rest.title != null
			if (hasColumn) {
				totalWidth += Number(rest.width || 180)

				rest.align ||= 'center'
				rest.showSorterTooltip ||= false

				tableColumns.push(rest)
			}

			if (search) {
				const normalizedSearch = { ...search }

				if (hasColumn) {
					if (!normalizedSearch.name) {
						if (typeof rest.dataIndex !== 'string') {
							throw new TypeError('error: search.name 或 column.dataIndex 必须赋值且是字符串类型')
						}

						normalizedSearch.name = rest.dataIndex as string
					}

					if (!normalizedSearch.label) {
						if (typeof rest.title !== 'string') {
							throw new TypeError('error: search.label 或 column.title 必须赋值且是字符串类型')
						}

						normalizedSearch.label = rest.title as string
					}
				}

				formItems.push(normalizedSearch as NormalizedItem)
			}
		})

		return {
			tableColumns,
			formItems,
			totalWidth
		}
	}, [columns])

	const searchRef = useRef<SearchFormInstance>(null)

	/**
	 * 用于控制 form 查询表单是否折叠
	 * 放在此处是方便设置 table 高度
	 */
	const [collapsed, setCollapsed] = useState(false)
	const tableY = useScrollY(tableElementRef, infiniteScroll, collapsed)
	const mergedPaginationConfig =
		typeof mergedTableProps.pagination === 'object' ? mergedTableProps.pagination : undefined
	const resolvedPagination: TableProps<T>['pagination'] =
		infiniteScroll || mergedTableProps.pagination === false
			? false
			: {
					rootClassName: '!mb-0',
					showQuickJumper: true,
					size: 'default',
					showTotal: (t: number) => `总计 ${t} 条`,
					hideOnSinglePage: true,
					position: ['bottomCenter'] as const,
					...(mergedPaginationConfig || {}),
					current: data.current,
					pageSize: data.pageSize,
					total: data.total
				}

	return (
		<div className={cl(className)} id="table-page">
			{formItems.length ? (
				<SearchForm
					ref={searchRef}
					className={searchWrapperClass}
					searchs={formItems}
					formProps={formProps}
					collapsed={collapsed}
					setCollapsed={setCollapsed}
					onSearch={(values = {}) => {
						const next = filter(values)

						const { formToQueryObject } = searchRef.current!

						Object.keys(next).forEach(key => {
							const item = formToQueryObject[key]
							if (item) {
								const result = item.handler(next[key] as never)
								if (typeof result === 'object') {
									delete next[key]

									Object.keys(result).forEach(k => {
										next[k] = result[k as keyof typeof result]
									})
								} else {
									next[key] = result
								}
							}
						})

						actionRef.current = 'search'

						setSearchParams(
							toSearchParamsInit({
								...permanentQuery,
								...next
							}),
							{ replace: true }
						)

						if (infiniteScroll) {
							const scrollContainer = tableElementRef.current?.querySelector('.ant-table-tbody-virtual-holder')
							scrollContainer?.scrollTo(0, 0)
						}
					}}
				/>
			) : null}
			<div
				ref={tableElementRef}
				id="tableWrapper"
				className={cl('p-4 bg-white shadow-sm rounded', tableWrapperClass, infiniteScroll ? 'flex-1' : '')}
			>
				{parseSummary(summary)}
				<Table
					{...mergedTableProps}
					scroll={{
						x: totalWidth,
						y: tableY
					}}
					dataSource={data.list}
					columns={tableColumns}
					virtual={infiniteScroll}
					onScroll={e => {
						if (infiniteScroll) {
							const el = e.target as HTMLElement
							const restCount = data.total % data.pageSize
							const totalPages = (data.total - restCount) / data.pageSize + (restCount > 0 ? 1 : 0)
							const hasNextPage = data.current < totalPages
							const nextPage = data.current + 1
							const isPendingPage = pendingInfinitePageRef.current === nextPage

							if (
								el.scrollHeight - el.scrollTop - el.clientHeight < 100 &&
								hasNextPage &&
								!mergedTableProps.loading &&
								!isPendingPage
							) {
								actionRef.current = 'paginate'
								markPendingInfinitePage(nextPage)
								const result = getChangedParameters(searchParams, {
									currentPage: String(nextPage)
								})

								onChange?.(result, actionRef.current)
							}
						}
					}}
					onChange={(pagination, _, sorter, { action }) => {
						const { current, pageSize } = pagination

						actionRef.current = action
						if (action === 'paginate') {
							setSearchParams(
								s => {
									const query = copyFromSearchParams(s)
									return {
										...query,
										...permanentQuery,
										_currentPage: String(pageSize != data.pageSize ? 1 : current),
										_pageSize: String(pageSize)
									}
								},
								{ replace: true }
							)
						} else if (action === 'filter') {
							/** @TODO */
						} else if (action === 'sort') {
							const payload = filter({
								_sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
								_sortName: Array.isArray(sorter) ? undefined : sorter.column?.dataIndex
							})

							setSearchParams(
								s => {
									const query = copyFromSearchParams(s, ['_sortOrder', '_sortName'])
									return {
										...query,
										...permanentQuery,
										...payload,
										_currentPage: '1',
										_pageSize: String(pageSize)
									}
								},
								{ replace: true }
							)
						}
					}}
					pagination={resolvedPagination}
				/>
			</div>
		</div>
	)
}

function scrollToTableTop(
	container: ScrollContainer,
	tableElement: HTMLDivElement,
	offsetTop: number,
	scrollToTop: boolean | ((tableElement: HTMLDivElement) => number)
) {
	const nextTop =
		typeof scrollToTop === 'function' ? scrollToTop(tableElement) : getTableTop(tableElement, container) - offsetTop

	if ('scrollTo' in container) {
		container.scrollTo({
			top: nextTop
		})
	}
}

function getTableTop(tableElement: HTMLDivElement, container: ScrollContainer) {
	if (isWindowContainer(container)) {
		return window.scrollY + tableElement.getBoundingClientRect().top
	}

	const containerRect = container.getBoundingClientRect()
	const tableRect = tableElement.getBoundingClientRect()

	return container.scrollTop + tableRect.top - containerRect.top
}

function isWindowContainer(container: ScrollContainer): container is Window {
	return container === window
}

function getPaddingBottom(element: Element | null | undefined) {
	if (!(element instanceof HTMLElement)) {
		return 0
	}

	const value = Number.parseInt(window.getComputedStyle(element).paddingBottom, 10)
	return Number.isFinite(value) ? value : 0
}

function getVirtualScrollContainer(tableElement: HTMLDivElement) {
	return tableElement.querySelector<HTMLElement>('.ant-table-tbody-virtual, .ant-table-placeholder')
}

function getTableScrollY(tableElement: HTMLDivElement) {
	const scrollContainer = getVirtualScrollContainer(tableElement)
	if (!scrollContainer) {
		return undefined
	}

	const tablePage = tableElement.closest('#table-page')
	const rect = scrollContainer.getBoundingClientRect()
	const tablePaddingBottom = getPaddingBottom(tableElement)
	const pagePaddingBottom = getPaddingBottom(tablePage?.parentElement)

	return Math.max(window.innerHeight - rect.top - tablePaddingBottom - pagePaddingBottom, 0)
}

function useScrollY(tableElementRef: RefObject<HTMLDivElement | null>, infiniteScroll: boolean, collapsed: boolean) {
	const location = useLocation()
	const [tableY, setTableY] = useState<number>()

	useEffect(() => {
		if (!infiniteScroll) {
			setTableY(undefined)
			return
		}

		const tableElement = tableElementRef.current
		if (!tableElement) {
			return
		}

		let frameId = 0
		let followupFrameId = 0
		const resizeObserver = new ResizeObserver(() => {
			scheduleMeasure()
		})
		const mutationObserver = new MutationObserver(() => {
			scheduleMeasure()
		})

		const measure = () => {
			const nextTableY = getTableScrollY(tableElement)
			if (nextTableY != null) {
				setTableY(nextTableY)
			}
		}

		const scheduleMeasure = () => {
			window.cancelAnimationFrame(frameId)
			window.cancelAnimationFrame(followupFrameId)
			frameId = window.requestAnimationFrame(() => {
				followupFrameId = window.requestAnimationFrame(measure)
			})
		}

		scheduleMeasure()
		resizeObserver.observe(tableElement)

		const tablePage = tableElement.closest('#table-page')
		if (tablePage instanceof HTMLElement) {
			resizeObserver.observe(tablePage)
		}

		if (tablePage?.parentElement instanceof HTMLElement) {
			resizeObserver.observe(tablePage.parentElement)
		}

		const scrollContainer = getVirtualScrollContainer(tableElement)
		if (scrollContainer) {
			resizeObserver.observe(scrollContainer)
		}

		mutationObserver.observe(tableElement, {
			childList: true,
			subtree: true
		})
		window.addEventListener('resize', scheduleMeasure)

		return () => {
			window.cancelAnimationFrame(frameId)
			window.cancelAnimationFrame(followupFrameId)
			window.removeEventListener('resize', scheduleMeasure)
			resizeObserver.disconnect()
			mutationObserver.disconnect()
		}
	}, [tableElementRef, infiniteScroll, location, collapsed])

	return tableY
}

