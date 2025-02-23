import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import RecipeForm from '../../RecipeForm'

export default async function EditRecipePage({ params }: { params: { id: string } }) {
	const supabase = await createClient()

	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) {
		redirect('/sign-in')
	}

	// Check if user owns this recipe
	const { data: recipe } = await supabase
		.from('recipes')
		.select('user_id')
		.eq('id', params.id)
		.single()

	if (!recipe || recipe.user_id !== user.id) {
		redirect('/')
	}

	// Fetch existing tags for the dropdown
	const { data: existingTags } = await supabase
		.from('tags')
		.select('id, name, created_at')
		.order('name')

	return (
		<main className="flex-1 flex flex-col items-center min-h-[60vh] px-4 py-8 w-full max-w-3xl mx-auto">
			<h1 className="text-3xl font-bold mb-8">Edit Recipe</h1>
			<RecipeForm recipeId={params.id} existingTags={existingTags || []} />
		</main>
	)
}
