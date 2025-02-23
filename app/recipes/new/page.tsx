import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import RecipeForm from '../RecipeForm'

export default async function NewRecipePage() {
	const supabase = await createClient()

	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) {
		redirect('/sign-in')
	}

	// Fetch existing tags for the dropdown
	const { data: existingTags } = await supabase
		.from('tags')
		.select('id, name, created_at')
		.order('name')

	return (
		<main className="flex-1 flex flex-col items-center min-h-[60vh] px-4 py-8 w-full max-w-3xl mx-auto">
			<h1 className="text-3xl font-bold mb-8">Create New Recipe</h1>
			<RecipeForm existingTags={existingTags || []} />
		</main>
	)
}
