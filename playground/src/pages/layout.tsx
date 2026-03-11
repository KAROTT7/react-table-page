// import BasicLayout from '@/components/layout/Layout'
// import { type SideMenuItem } from '@/components/layout/SideMenu'
// import { BarChart3, CheckCircle2, Home, MenuSquare, Shield, ShoppingCart, Users } from 'lucide-react'
import { Outlet } from 'react-router-dom'

// const menuItems: SideMenuItem[] = [{ key: '/', label: '首页', icon: Home }]

export function Component() {
	// return <BasicLayout menuItems={menuItems} />
	return (
		<div className="p-3 bg-slate-200 min-h-screen">
			<Outlet />
		</div>
	)
}

