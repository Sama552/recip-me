import Link from 'next/link'

export default async function Home() {
	return (
		<main className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4">
			<h1 className="text-4xl font-bold mb-8">Welcome to Recip-me</h1>
			<div className="flex gap-4">
				<Link
					href="/sign-in"
					className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
				>
					Sign In
				</Link>
				<Link
					href="/sign-up"
					className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
				>
					Sign Up
				</Link>
			</div>
		</main>
	)
}
