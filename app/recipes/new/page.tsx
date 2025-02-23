import { Tag } from '@/app/types/recipe'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import RecipeForm from '../RecipeForm'

type TagApiResponse = {
	existingTags: Tag[]
}

export default async function NewRecipePage() {
	const supabase = await createClient()

	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) {
		redirect('/sign-in')
	}

	const cookieStore = await cookies()
	const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tags`, {
		headers: {
			Cookie: cookieStore.toString(),
		},
	})

	const { existingTags } = (await response.json()) as TagApiResponse

	return (
		<main className="flex-1 flex flex-col items-center min-h-[60vh] px-4 py-8 w-full max-w-3xl mx-auto">
			<h1 className="text-3xl font-bold mb-8">Create New Recipe</h1>
			<RecipeForm existingTags={existingTags || []} />
		</main>
	)
}
