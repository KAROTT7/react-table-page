import { Link } from 'react-router-dom'

export function Component() {
	return (
		<div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
			<p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500">404</p>
			<h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">Page not found</h1>
			<p className="mt-3 max-w-xl text-sm leading-6 text-mist">
				The route does not exist in the playground. Go back to the demo page and keep testing the
				component behavior there.
			</p>
			<Link
				to="/"
				className="mt-8 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
			>
				Back to playground
			</Link>
		</div>
	)
}