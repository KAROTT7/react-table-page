import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, type MenuProps } from 'antd'
import { type LucideIcon } from 'lucide-react'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { cn } from '@/utils'

export type SideMenuItem = {
	key: string
	label: string
	icon: LucideIcon
	children?: SideMenuItem[]
}

type SideMenuProps = {
	collapsed: boolean
	toggleExpand(): void
	items: SideMenuItem[]
}

const genePaths = (pathname: string): string[] => {
	const segments = pathname.split('/').reduce((paths: string[], p, index, arr) => {
		if (p) {
			paths.push(arr.slice(0, index + 1).join('/'))
		}

		return paths
	}, [])

	if (segments[0] != '/') {
		segments.unshift('/')
	}

	return segments
}

function convertToAntdMenuItems(items: SideMenuItem[]): MenuProps['items'] {
	return items.map(item => {
		const Icon = item.icon
		const iconElement = <Icon className="w-4 h-4" />

		if (item.children) {
			return {
				key: item.key,
				icon: iconElement,
				label: item.label,
				children: item.children.map(child => {
					const ChildIcon = child.icon
					return {
						key: child.key,
						icon: <ChildIcon className="w-4 h-4" />,
						label: child.label
					}
				})
			}
		}

		return {
			key: item.key,
			icon: iconElement,
			label: item.label
		}
	})
}

function getParentKey(items: SideMenuItem[], key: string): string | null {
	// 查找给定 key 的父菜单 key
	for (const item of items) {
		if (item.children) {
			for (const child of item.children) {
				if (child.key === key) {
					return item.key
				}
			}
		}
	}
	return null
}

export default function SideMenu({ collapsed, toggleExpand, items }: SideMenuProps) {
	const navigate = useNavigate()
	const { pathname } = useLocation()

	const paths = useMemo(() => genePaths(pathname), [pathname])

	// 计算派生状态
	const selectedKeys = useMemo(() => (paths.length === 1 ? paths : paths.slice(1)), [paths])

	const defaultOpenKeys = useMemo(() => {
		// 根据当前选中的菜单项，找出需要展开的父菜单
		if (collapsed) {
			return []
		}

		const requiredKeys = new Set<string>()
		for (const key of selectedKeys) {
			const parentKey = getParentKey(items, key)
			if (parentKey) {
				requiredKeys.add(parentKey)
			}
		}
		return Array.from(requiredKeys)
	}, [selectedKeys, collapsed, items])

	// 用户手动打开的菜单项
	const [openKeys, setOpenKeys] = useState<string[]>(defaultOpenKeys)

	// 当路由或 collapsed 变化时，重置 openKeys
	useEffect(() => {
		setOpenKeys(defaultOpenKeys)
	}, [defaultOpenKeys])

	function onOpenChange(keys: string[]) {
		setOpenKeys(keys)
	}

	function onSelect({ key }: { key: string }) {
		// 导航到选中的菜单项，路由变化后会自动更新 selectedKeys 和 openKeys
		navigate(key)
	}

	const handleToggleExpand = () => {
		toggleExpand()
	}

	const menuIconClass = 'cursor-pointer hover:!text-blue-700 transition-colors'
	return (
		<div className="bg-white h-full shadow-[0_2px_2px_rgba(0,0,0,0.05)] flex flex-col">
			<div className="flex-1 overflow-y-auto">
				<Menu
					mode="inline"
					inlineCollapsed={collapsed}
					selectedKeys={selectedKeys}
					openKeys={openKeys}
					onSelect={onSelect}
					onOpenChange={onOpenChange}
					items={convertToAntdMenuItems(items)}
				/>
			</div>
			<div className={cn('p-2 flex justify-end')}>
				{!collapsed ? (
					<MenuFoldOutlined className={menuIconClass} onClick={handleToggleExpand} />
				) : (
					<MenuUnfoldOutlined className={menuIconClass} onClick={handleToggleExpand} />
				)}
			</div>
		</div>
	)
}
