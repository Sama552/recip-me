import { Recipe, Tag } from '@/app/types/recipe'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { id: string } }) {
	try {
		const supabase = await createClient()
		const { id } = await params

		// Get the current user
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser()

		const cookieStore = await cookies()

		// Debug authentication
		console.log('Auth Debug:', {
			cookies: cookieStore.toString(),
			user: user,
			userError: userError,
		})

		if (!user) {
			return NextResponse.json(
				{
					error: 'Unauthorized',
					debug: { userError },
				},
				{ status: 401 }
			)
		}

		// Fetch the recipe with all related data
		const { data: recipe, error } = await supabase
			.from('recipes')
			.select(
				`
				*,
				ingredients (
					name,
					amount,
					unit,
					notes
				),
				instructions (
					step_number,
					description
				),
				recipe_tags (
					tags (
						id,
						name,
						created_at
					)
				)
			`
			)
			.eq('id', id)
			.single()

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		if (!recipe || recipe.user_id !== user.id) {
			return NextResponse.json({ error: 'Not found' }, { status: 404 })
		}

		// Fetch tags
		const { data: existingTags } = await supabase
			.from('tags')
			.select('id, name, created_at')
			.order('name')

		return NextResponse.json({
			recipe: recipe as Recipe,
			existingTags: (existingTags || []) as Tag[],
		})
	} catch (error) {
		console.error('API Error:', error)
		return NextResponse.json(
			{
				error: 'Internal Server Error',
				debug: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		)
	}
}
