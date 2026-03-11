import { type PropsWithChildren } from 'react'
import { cn } from '@/utils'

export interface PanelProps extends PropsWithChildren {
	className?: string
	mode?: 'fixed' | 'default'
	id?: string
}

export default function Panel(props: PanelProps) {
	const { className, children, mode = 'default', id } = props

	if (mode === 'fixed') {
		return (
			<div className={cn('h-full overflow-y-auto bg-white rounded shadow p-3', className)} id={id}>
				{children}
			</div>
		)
	}

	return (
		<div className={cn('bg-white rounded p-3 shadow', className)} id={id}>
			{children}
		</div>
	)
}

