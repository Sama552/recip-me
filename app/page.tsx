import { Recipe } from '@/app/types/recipe'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/utils/supabase/server'
import { Clock, Users } from 'lucide-react'
import Link from 'next/link'

export default async function Home() {
	const supabase = await createClient()

	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
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

	// Fetch user's recipes with their tags
	const { data: recipes, error } = await supabase
		.from('recipes')
		.select(
			`
			*,
			recipe_tags!inner (
				tags!inner (
					id,
					name,
					created_at
				)
			)
		`
		)
		.order('created_at', { ascending: false })
		.returns<Recipe[]>()

	if (error) {
		console.error('Error fetching recipes:', error)
	}

	if (!recipes || recipes.length === 0) {
		return (
			<main className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4">
				<h1 className="text-2xl font-bold mb-4">No recipes found</h1>
				<Link
					href="/recipes/new"
					className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
				>
					Create Your First Recipe
				</Link>
			</main>
		)
	}

	return (
		<main className="flex-1 flex flex-col items-center min-h-[60vh] px-4 py-8 w-full max-w-7xl mx-auto">
			<div className="w-full flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">Your Recipes</h1>
				<Link
					href="/recipes/new"
					className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
				>
					Add New Recipe
				</Link>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
				{recipes.map(recipe => (
					<Link
						key={recipe.id}
						href={`/recipes/${recipe.id}`}
						className="group border rounded-lg p-6 hover:border-primary transition-colors"
					>
						<h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
							{recipe.title}
						</h2>
						<p className="text-muted-foreground text-sm mb-4 line-clamp-2">{recipe.description}</p>
						<div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
							<div className="flex items-center gap-1">
								<Clock size={16} />
								<span>
									{recipe.prep_time?.toString()} + {recipe.cook_time?.toString()}
								</span>
							</div>
							<div className="flex items-center gap-1">
								<Users size={16} />
								<span>Serves {recipe.servings}</span>
							</div>
						</div>
						<div className="flex flex-wrap gap-2">
							{recipe.recipe_tags?.map(({ tags }) => (
								<Badge key={tags.id} variant="secondary">
									{tags.name}
								</Badge>
							))}
						</div>
					</Link>
				))}
			</div>
		</main>
	)
}
