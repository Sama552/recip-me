import { Recipe, Tag } from '@/app/types/recipe'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/server'
import { ArrowLeft, Clock, Globe, Pencil, Users } from 'lucide-react'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type RecipeApiResponse = {
	recipe: Recipe
	existingTags: Tag[]
}

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const supabase = await createClient()

	// Get current user for edit permission check
	const {
		data: { user },
	} = await supabase.auth.getUser()

	// Fetch recipe data from our API endpoint
	const cookieStore = await cookies()
	const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/recipes/${id}`, {
		headers: {
			Cookie: cookieStore.toString(),
		},
	})

	if (!response.ok) {
		if (response.status === 404) {
			notFound()
		}
		// Handle other errors
		console.error('Error fetching recipe:', await response.text())
		notFound()
	}

	const { recipe } = (await response.json()) as RecipeApiResponse

	const canEdit = user?.id === recipe.user_id

	return (
		<div className="max-w-4xl mx-auto px-4 py-8">
			<div className="flex justify-between items-start mb-8">
				<Link
					href="/"
					className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft size={16} />
					Back to Recipes
				</Link>
				{canEdit && (
					<Link href={`/recipes/${id}/edit`}>
						<Button variant="outline" className="flex items-center gap-2">
							<Pencil size={16} />
							Edit Recipe
						</Button>
					</Link>
				)}
			</div>

			<div className="space-y-8">
				<div>
					<h1 className="text-4xl font-bold mb-4">{recipe.title}</h1>
					<p className="text-lg text-muted-foreground mb-6">{recipe.description}</p>

					<div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<Clock size={16} />
							<span>
								Prep: {recipe.prep_time?.toString()} + Cook: {recipe.cook_time?.toString()}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<Users size={16} />
							<span>Serves {recipe.servings}</span>
						</div>
						{recipe.source_url && (
							<Link
								href={recipe.source_url}
								className="flex items-center gap-2 hover:text-foreground"
								target="_blank"
								rel="noopener noreferrer"
							>
								<Globe size={16} />
								<span>Source</span>
							</Link>
						)}
					</div>

					<div className="flex flex-wrap gap-2 mt-4">
						{recipe.recipe_tags?.map(({ tags }: { tags: Tag }) => (
							<Badge key={tags.id} variant="secondary">
								{tags.name}
							</Badge>
						))}
					</div>
				</div>

				<div>
					<h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
					<ul className="space-y-2">
						{recipe.ingredients
							?.sort((a: Recipe['ingredients'][0], b: Recipe['ingredients'][0]) =>
								a.name.localeCompare(b.name)
							)
							.map((ingredient: Recipe['ingredients'][0]) => (
								<li key={ingredient.name} className="flex items-baseline gap-2">
									<span className="font-medium">
										{ingredient.amount} {ingredient.unit}
									</span>
									<span>{ingredient.name}</span>
									{ingredient.notes && (
										<span className="text-sm text-muted-foreground">({ingredient.notes})</span>
									)}
								</li>
							))}
					</ul>
				</div>

				<div>
					<h2 className="text-2xl font-semibold mb-4">Instructions</h2>
					<ol className="space-y-4">
						{recipe.instructions
							?.sort(
								(a: Recipe['instructions'][0], b: Recipe['instructions'][0]) =>
									a.step_number - b.step_number
							)
							.map((instruction: Recipe['instructions'][0]) => (
								<li key={instruction.step_number} className="flex gap-4">
									<span className="font-medium text-muted-foreground">
										{instruction.step_number}.
									</span>
									<span>{instruction.description}</span>
								</li>
							))}
					</ol>
				</div>
			</div>
		</div>
	)
}
