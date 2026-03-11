# react-table-page

`react-table-page` 是一个面向中后台列表页场景的 React 组件库，核心提供 `TablePage` 和 `TablePageConfig` 两个导出，用来统一处理查询表单、表格展示、分页或虚拟滚动、以及 URL 查询参数同步。

当前构建产物为 ESM，并输出 TypeScript 声明文件。

## 安装

仓库和开发流程只支持 `pnpm >= 10.0.0`。

```bash
pnpm add react-table-page
```

如果你是在这个仓库里进行开发：

```bash
pnpm install
```

## Peer Dependencies

使用方需要自行安装这些 peer dependencies：

- `react`
- `react-dom`
- `react-router-dom`
- `antd`

库内已包含这些运行时依赖：

- `dayjs`
- `classnames`
- `@ant-design/icons`

## 导出

包根当前导出：

```ts
import TablePage, { TablePageConfig, type TableColumn } from 'react-table-page'
```

也支持子路径导出：

```ts
import TablePage, { TablePageConfig } from 'react-table-page/component'
```

## 快速开始

```tsx
import { useState } from 'react'
import TablePage, { TablePageConfig, type TableColumn } from 'react-table-page'

interface UserItem {
	id: number
	name: string
	status: string
}

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
			enums: {
				enabled: '启用',
				disabled: '禁用'
			}
		}
	}
]

export default function UserPage() {
	const [tableData] = useState({
		list: [],
		current: 1,
		pageSize: 10,
		total: 0
	})

	return (
		<TablePageConfig enableFormCollapse>
			<TablePage
				columns={columns}
				tableData={tableData}
				onChange={(query, action) => {
					console.log(query, action)
				}}
			/>
		</TablePageConfig>
	)
}
```

## 组件能力

- 在列定义上直接扩展 `search`，把表格字段和查询项放在同一处维护
- 自动同步查询参数到 URL，支持页面刷新后的表单回填
- 支持普通分页和虚拟滚动两种表格模式
- 支持 `input`、`select`、`datePicker`、`rangePicker`、`textarea`、`rangeInput`、`custom` 等查询项
- 通过 `TablePageConfig` 统一控制文案、表格默认配置、时间处理和滚动容器

## 使用前提

- 组件运行在 `react-router-dom` 路由上下文内
- 项目使用 TypeScript 时需要开启 JSX 支持
- 表格默认 `rowKey` 为 `id`，如果主键字段不同，需要自行覆盖

## 详细文档

组件的详细能力、URL 参数约定、上下文配置项和完整示例见 [src/component/README.md](src/component/README.md)。

## 开发命令

- `pnpm build`：构建组件库产物到 `dist/`
- `pnpm dev`：Rollup watch 模式
- `pnpm lint`：执行 ESLint
- `pnpm format`：执行 Prettier 格式化
- `pnpm test`：执行 Vitest
- `pnpm typecheck`：执行 TypeScript 类型检查
- `pnpm check`：执行完整发布前校验

## 发布

执行 `pnpm publish` 前，仓库会自动触发 `prepublishOnly`，也就是先跑一遍 `pnpm check`，确保 lint、typecheck、test 和 build 全部通过。
