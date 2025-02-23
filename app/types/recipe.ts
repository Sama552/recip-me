import { Database } from '@/supabase/types/supabase'

type DbRecipe = Database['public']['Tables']['recipes']['Row']
type DbIngredient = Database['public']['Tables']['ingredients']['Row']
type DbInstruction = Database['public']['Tables']['instructions']['Row']
type DbTag = Database['public']['Tables']['tags']['Row']
type DbRecipeTag = Database['public']['Tables']['recipe_tags']['Row']

export type Recipe = DbRecipe & {
	ingredients: DbIngredient[]
	instructions: DbInstruction[]
	recipe_tags: Array<{
		tags: DbTag
	}>
}

export type RecipeFormData = {
	title: string
	description: string | null
	prep_time: unknown | null
	cook_time: unknown | null
	servings: number | null
	user_id: string | null
}

export type IngredientFormData = {
	recipe_id: string
	amount: number | null
	unit: string | null
	name: string
	notes: string | null
}

export type InstructionFormData = {
	recipe_id: string
	step_number: number
	description: string
}

export type RecipeTagFormData = {
	recipe_id: string
	tag_id: string
}

export type Tag = DbTag
