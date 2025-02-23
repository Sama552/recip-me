import { Recipe, Tag } from '@/app/types/recipe'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import RecipeForm from '../../RecipeForm'

type RecipeApiResponse = {
	recipe: Recipe
	existingTags: Tag[]
}

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params

	// Fetch recipe and tags from our API endpoint
	const cookieStore = await cookies()
	const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/recipes/${id}`, {
		headers: {
			// Forward the cookies to maintain the authentication state
			Cookie: cookieStore.toString(),
		},
	})
	if (!response.ok) {
		// Handle various error cases
		if (response.status === 401) {
			redirect('/sign-in')
		} else {
			redirect('/')
		}
	}

	const { recipe, existingTags } = (await response.json()) as RecipeApiResponse

	return (
		<main className="flex-1 flex flex-col items-center min-h-[60vh] px-4 py-8 w-full max-w-3xl mx-auto">
			<h1 className="text-3xl font-bold mb-8">Edit Recipe</h1>
			<RecipeForm existingTags={existingTags} recipe={recipe} />
		</main>
	)
}
