# TablePage 组件说明

`src/component` 提供了一组围绕列表页场景封装的 React 组件，核心目标是把“查询表单 + 表格 + 分页/滚动加载 + URL 参数同步”收敛到一个统一入口里，减少业务页重复搭建。

## 目录结构

- `index.tsx`：组件入口，初始化 `dayjs.utc`，导出 `TablePageConfig` 和 `TablePage`
- `TablePage.tsx`：页面级主组件，负责表格渲染、查询联动、分页、排序、滚动行为
- `SearchForm.tsx`：查询表单容器，负责表单布局、折叠、提交、重置、初始值回填
- `context.tsx`：全局配置上下文，统一控制文案、表格默认行为、时间处理、容器滚动等
- `getElement.tsx`：查询项规范化与 URL 参数转换逻辑
- `FormInput.tsx`、`FormSelect.tsx`、`FormDatePicker.tsx`、`FormRangePicker.tsx`、`FormInputTextarea.tsx`、`FormRangeInput.tsx`：不同表单控件的展示层封装
- `FormLabel.tsx`：浮动标签渲染

## 核心能力

### 1. 列定义与查询项合并配置

`TablePage` 在 `columns` 上扩展了 `search` 字段。一个列既可以定义表格展示，也可以顺手定义对应的查询项。

```tsx
import TablePage, { TablePageConfig, type TableColumn } from './component'

interface UserItem {
	id: number
	name: string
	status: string
	createdAt: string
}

const columns: TableColumn<UserItem>[] = [
	{
		title: '姓名',
		dataIndex: 'name',
		width: 180,
		search: {
			type: 'input'
		}
	},
	{
		title: '状态',
		dataIndex: 'status',
		width: 160,
		search: {
			type: 'select',
			enums: {
				enabled: '启用',
				disabled: '禁用'
			}
		}
	},
	{
		title: '创建时间',
		dataIndex: 'createdAt',
		width: 220,
		sorter: true,
		search: {
			type: 'rangePicker',
			postArgs: ['createdAtStart', 'createdAtEnd']
		}
	}
]
```

如果 `search.name` 未传，会回退到列的 `dataIndex`。如果 `search.label` 未传，会回退到列的 `title`。这意味着大部分场景下只需要在列上补充 `type` 和少量额外参数即可。

### 2. 查询表单与 URL 参数双向同步

组件内部依赖 `react-router-dom` 的 `useSearchParams` 与 `useLocation`，会把查询状态映射到 URL 上，同时在页面刷新或分享链接时自动回填表单。

当前约定如下：

| 场景       | URL 参数                                                      |
| ---------- | ------------------------------------------------------------- |
| 普通查询项 | 直接使用字段名，如 `name=Tom`                                 |
| 分页       | `_currentPage`、`_pageSize`                                   |
| 排序       | `_sortOrder`、`_sortName`                                     |
| 区间时间   | 默认 `${name}Start`、`${name}End`，也可通过 `postArgs` 自定义 |
| 区间输入   | 默认 `${name}Start`、`${name}End`，也可通过 `postArgs` 自定义 |

点击查询时，组件会过滤空字符串和空值，再触发 `onChange`，把拼装后的参数和当前动作类型回传给业务层。

### 3. 支持分页表格与虚拟滚动表格

`TablePage` 同时支持两种列表模式：

- 默认模式：使用 antd `pagination` 做分页
- 虚拟滚动模式：当 `tableProps.virtual` 或上下文中的 `tableConfig.virtual` 为 `true` 时启用滚动加载

滚动模式下，组件会在接近底部时自动触发下一页请求，并根据容器位置动态计算表格的 `scroll.y`。

### 4. 统一上下文配置

`TablePageConfig` 用于给整个表格页提供统一默认值，适合在业务系统层面做一次包裹。

```tsx
<TablePageConfig
	searchText="查询"
	clearText="重置"
	enableFormCollapse
	collapsedAfterSearch
	labelPlacement="absolute"
	rangePickerPlaceholder={['开始时间', '结束时间']}
	tableConfig={{
		rowKey: 'id',
		size: 'small',
		bordered: true
	}}
>
	<TablePage columns={columns} tableData={tableData} onChange={handleChange} />
</TablePageConfig>
```

支持的上下文配置包括：

- `formConfig`：透传 antd Form 默认配置
- `tableConfig`：透传 antd Table 默认配置
- `tableDataMap`：适配接口返回结构字段名
- `searchText`、`clearText`、`closeText`、`expandText`：文案配置
- `selectAllText`：下拉单选默认“全部”文案
- `rangePickerPlaceholder`：时间区间占位文案
- `collapsedAfterSearch`：查询后是否自动折叠表单
- `labelPlacement`：标签显示模式，支持 `absolute` 和 `default`
- `rowGutter`：查询表单栅格间距
- `utc`：是否将时间查询转换为 UTC 字符串
- `getContainer`：滚动容器获取函数
- `enableFormCollapse`：是否启用表单折叠展开
- `hiddenFormButtons`：是否隐藏查询和重置按钮

### 5. 多种查询控件

当前支持的查询项类型：

| type          | 说明                           |
| ------------- | ------------------------------ |
| `input`       | 普通输入框                     |
| `select`      | 下拉选择，支持单选和多选       |
| `datePicker`  | 单日期选择                     |
| `rangePicker` | 日期区间选择，自动映射起止参数 |
| `textarea`    | 多行文本                       |
| `rangeInput`  | 最小值/最大值输入              |
| `custom`      | 自定义 React 节点              |

其中：

- `select.enums` 支持对象、字符串数组、选项数组，或者基于当前表单值动态生成
- `rangePicker` 和 `rangeInput` 支持 `postArgs` 自定义参数名
- `visible` 可传布尔值或函数，用于根据当前表单值动态控制查询项显示

## 数据结构

`TablePage` 默认读取如下结构：

```ts
interface TablePageData<T = any> {
	list: T[]
	current: number
	pageSize: number
	total: number
}
```

如果后端接口不是这套字段名，可以通过 `TablePageConfig` 的 `tableDataMap` 做映射，例如：

```tsx
<TablePageConfig
	tableDataMap={{
		list: 'records',
		current: 'pageNum',
		pageSize: 'pageSize',
		total: 'totalCount'
	}}
>
	{children}
</TablePageConfig>
```

## 回调约定

`onChange` 的签名为：

```ts
onChange?(query: Record<string, string | number>, action: 'paginate' | 'filter' | 'sort' | 'search'): void
```

可用于统一发起请求。通常推荐在回调中直接根据 `query` 调用接口，而不是自己再从表单取值。

## 使用建议

推荐接入方式：

1. 让页面运行在 `react-router-dom` 路由上下文里。
2. 由业务页维护接口请求，并把结果以 `tableData` 形式传入。
3. 把通用文案、表格默认配置、滚动容器逻辑放在 `TablePageConfig` 中统一管理。
4. 列上的查询项尽量和表头配置放在一起，减少列表页心智分散。

## 当前实现依赖与注意事项

- 依赖 `react`、`react-router-dom`、`antd`、`dayjs`、`classnames`、`@ant-design/icons`
- 入口文件会执行 `dayjs.extend(utc)`，因此时间区间查询默认具备 UTC 转换能力
- 当前组件源码使用 `.tsx`，项目 TypeScript 配置需要开启 JSX 支持
- 表格默认 `rowKey` 是 `id`，如果数据主键不是 `id`，建议通过 `TablePageConfig.tableConfig.rowKey` 或 `tableProps.rowKey` 覆盖
- `rangeInput` 当前是本地双输入框实现，适合数值或字符串区间查询

## 一个完整示例

```tsx
import { useEffect, useState } from 'react'
import TablePage, { TablePageConfig, type TableColumn } from './component'

interface UserItem {
	id: number
	name: string
	status: string
	createdAt: string
}

export default function UserPage() {
	const [tableData, setTableData] = useState({
		list: [],
		current: 1,
		pageSize: 10,
		total: 0
	})

	const columns: TableColumn<UserItem>[] = [
		{
			title: '姓名',
			dataIndex: 'name',
			search: { type: 'input' }
		},
		{
			title: '状态',
			dataIndex: 'status',
			search: {
				type: 'select',
				enums: ['enabled', 'disabled']
			}
		},
		{
			title: '创建时间',
			dataIndex: 'createdAt',
			search: { type: 'rangePicker' }
		}
	]

	const handleChange = async (query: Record<string, string | number>) => {
		const response = await fetchUsers(query)
		setTableData(response)
	}

	useEffect(() => {
		void handleChange({ currentPage: 1, pageSize: 10 })
	}, [])

	return (
		<TablePageConfig enableFormCollapse>
			<TablePage columns={columns} tableData={tableData} onChange={handleChange} />
		</TablePageConfig>
	)
}
```

这个组件更适合“中后台列表页”这类强约束场景。如果目标是高度自由的自定义表格页，这套封装的优势会下降，但对于标准 CRUD 列表页，它能显著减少重复实现。
