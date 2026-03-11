import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { cn } from '@/utils'
import AppHeader from './AppHeader'
import SideMenu, { type SideMenuItem } from './SideMenu'

const MENU_EXPAND_KEY = 'side-menu-expand'

interface LayoutProps {
	menuItems: SideMenuItem[]
}

export default function Layout({ menuItems }: LayoutProps) {
	const [expand, setExpand] = useState(() => {
		const stored = localStorage.getItem(MENU_EXPAND_KEY)
		return stored !== null ? stored === 'true' : true
	})

	const toggleExpand = () => {
		setExpand(current => {
			const newValue = !current
			localStorage.setItem(MENU_EXPAND_KEY, String(newValue))
			return newValue
		})
	}

	return (
		<div className="h-screen bg-slate-100 flex flex-col overflow-hidden">
			<AppHeader />

			<div className="flex-1 min-h-0">
				<div className="flex h-full">
					<aside
						className={cn(expand ? 'w-48' : 'w-20', 'transition-[width] duration-200 ease-in-out will-change-auto')}
					>
						<SideMenu collapsed={!expand} toggleExpand={toggleExpand} items={menuItems} />
					</aside>

					{/** 自然布局 */}
					{/* <main className="flex-1 p-3 min-h-0 overflow-y-auto">
						<Panel mode="default">
							<Outlet />
						</Panel>
					</main> */}

					<main className="flex-1 p-3 min-h-0 overflow-y-auto">
						<Outlet />
					</main>

					{/** 固定布局 */}
					{/* <main className="flex-1 p-3 min-h-0">
						<Panel mode="fixed">
							<Outlet />
						</Panel>
					</main> */}
				</div>
			</div>
		</div>
	)
}

