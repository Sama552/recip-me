'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Database } from '@/supabase/types/supabase'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Recipe = Database['public']['Tables']['recipes']['Row']
type Tag = Database['public']['Tables']['tags']['Row']

interface RecipeFormProps {
	recipeId?: string
	existingTags: Tag[]
}

export default function RecipeForm({ recipeId, existingTags }: RecipeFormProps) {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(!!recipeId)
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Form state
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [prepTime, setPrepTime] = useState('')
	const [cookTime, setCookTime] = useState('')
	const [servings, setServings] = useState('')
	const [ingredients, setIngredients] = useState<
		Array<{ amount: string; unit: string; name: string; notes: string }>
	>([{ amount: '', unit: '', name: '', notes: '' }])
	const [instructions, setInstructions] = useState<string[]>([''])
	const [selectedTags, setSelectedTags] = useState<Tag[]>([])

	// Fetch recipe data if editing
	useEffect(() => {
		async function fetchRecipe() {
			if (!recipeId) return

			const supabase = createClient()
			const { data: recipe } = await supabase
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
				.eq('id', recipeId)
				.single()

			if (recipe) {
				setTitle(recipe.title)
				setDescription(recipe.description || '')
				setPrepTime(recipe.prep_time?.toString() || '')
				setCookTime(recipe.cook_time?.toString() || '')
				setServings(recipe.servings?.toString() || '')

				// Sort ingredients by name
				const sortedIngredients = [...(recipe.ingredients || [])].sort((a, b) =>
					a.name.localeCompare(b.name)
				)
				setIngredients(
					sortedIngredients.map(ing => ({
						amount: ing.amount?.toString() || '',
						unit: ing.unit || '',
						name: ing.name,
						notes: ing.notes || '',
					}))
				)

				// Sort instructions by step number
				const sortedInstructions = [...(recipe.instructions || [])].sort(
					(a, b) => a.step_number - b.step_number
				)
				setInstructions(sortedInstructions.map(inst => inst.description))

				// Set tags
				setSelectedTags(recipe.recipe_tags?.map((rt: any) => rt.tags) || [])
			}
			setIsLoading(false)
		}

		fetchRecipe()
	}, [recipeId])

	const addIngredient = () => {
		setIngredients([...ingredients, { amount: '', unit: '', name: '', notes: '' }])
	}

	const updateIngredient = (index: number, field: string, value: string) => {
		const newIngredients = [...ingredients]
		newIngredients[index] = { ...newIngredients[index], [field]: value }
		setIngredients(newIngredients)
	}

	const removeIngredient = (index: number) => {
		setIngredients(ingredients.filter((_, i) => i !== index))
	}

	const addInstruction = () => {
		setInstructions([...instructions, ''])
	}

	const updateInstruction = (index: number, value: string) => {
		const newInstructions = [...instructions]
		newInstructions[index] = value
		setInstructions(newInstructions)
	}

	const removeInstruction = (index: number) => {
		setInstructions(instructions.filter((_, i) => i !== index))
	}

	const addTag = (tagId: string) => {
		const tag = existingTags.find(t => t.id === tagId)
		if (tag && !selectedTags.find(t => t.id === tagId)) {
			setSelectedTags([...selectedTags, tag])
		}
	}

	const removeTag = (tagId: string) => {
		setSelectedTags(selectedTags.filter(tag => tag.id !== tagId))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)

		try {
			const supabase = createClient()

			// Get current user
			const {
				data: { user },
			} = await supabase.auth.getUser()
			if (!user) throw new Error('Not authenticated')

			const recipeData = {
				title,
				description,
				prep_time: prepTime,
				cook_time: cookTime,
				servings: parseInt(servings),
				user_id: user.id,
			}

			let finalRecipeId: string

			if (recipeId) {
				// Update existing recipe
				const { error: recipeError } = await supabase
					.from('recipes')
					.update(recipeData)
					.eq('id', recipeId)

				if (recipeError) throw recipeError
				finalRecipeId = recipeId

				// Delete existing related data
				await Promise.all([
					supabase.from('ingredients').delete().eq('recipe_id', recipeId),
					supabase.from('instructions').delete().eq('recipe_id', recipeId),
					supabase.from('recipe_tags').delete().eq('recipe_id', recipeId),
				])
			} else {
				// Create new recipe
				const { data: newRecipe, error: recipeError } = await supabase
					.from('recipes')
					.insert(recipeData)
					.select()
					.single()

				if (recipeError) throw recipeError
				finalRecipeId = newRecipe.id
			}

			// Insert ingredients
			if (ingredients.length > 0) {
				const { error: ingredientsError } = await supabase.from('ingredients').insert(
					ingredients.map(ing => ({
						recipe_id: finalRecipeId,
						amount: ing.amount ? parseFloat(ing.amount) : null,
						unit: ing.unit || null,
						name: ing.name,
						notes: ing.notes || null,
					}))
				)

				if (ingredientsError) throw ingredientsError
			}

			// Insert instructions
			if (instructions.length > 0) {
				const { error: instructionsError } = await supabase.from('instructions').insert(
					instructions
						.filter(instruction => instruction.trim())
						.map((description, index) => ({
							recipe_id: finalRecipeId,
							step_number: index + 1,
							description,
						}))
				)

				if (instructionsError) throw instructionsError
			}

			// Insert recipe tags
			if (selectedTags.length > 0) {
				const { error: tagsError } = await supabase.from('recipe_tags').insert(
					selectedTags.map(tag => ({
						recipe_id: finalRecipeId,
						tag_id: tag.id,
					}))
				)

				if (tagsError) throw tagsError
			}

			router.push(`/recipes/${finalRecipeId}`)
		} catch (error) {
			console.error('Error saving recipe:', error)
			// Here you would typically show an error message to the user
		} finally {
			setIsSubmitting(false)
		}
	}

	if (isLoading) {
		return <div>Loading...</div>
	}

	return (
		<form onSubmit={handleSubmit} className="w-full space-y-6">
			<div className="space-y-2">
				<Label htmlFor="title">Title</Label>
				<Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
			</div>

			<div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Input
					id="description"
					value={description}
					onChange={e => setDescription(e.target.value)}
				/>
			</div>

			<div className="grid grid-cols-3 gap-4">
				<div className="space-y-2">
					<Label htmlFor="prepTime">Prep Time (minutes)</Label>
					<Input
						id="prepTime"
						type="text"
						value={prepTime}
						onChange={e => setPrepTime(e.target.value)}
						placeholder="e.g. 30"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="cookTime">Cook Time (minutes)</Label>
					<Input
						id="cookTime"
						type="text"
						value={cookTime}
						onChange={e => setCookTime(e.target.value)}
						placeholder="e.g. 45"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="servings">Servings</Label>
					<Input
						id="servings"
						type="number"
						value={servings}
						onChange={e => setServings(e.target.value)}
						min="1"
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label>Tags</Label>
				<div className="flex flex-wrap gap-2 mb-2">
					{selectedTags.map(tag => (
						<Badge
							key={tag.id}
							variant="secondary"
							className="cursor-pointer"
							onClick={() => removeTag(tag.id)}
						>
							{tag.name} ×
						</Badge>
					))}
				</div>
				<Select onValueChange={addTag}>
					<SelectTrigger>
						<SelectValue placeholder="Select a tag" />
					</SelectTrigger>
					<SelectContent>
						{existingTags
							.filter(tag => !selectedTags.find(t => t.id === tag.id))
							.map(tag => (
								<SelectItem key={tag.id} value={tag.id}>
									{tag.name}
								</SelectItem>
							))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<Label>Ingredients</Label>
					<Button type="button" variant="outline" onClick={addIngredient}>
						Add Ingredient
					</Button>
				</div>
				{ingredients.map((ingredient, index) => (
					<div key={index} className="grid grid-cols-12 gap-2">
						<div className="col-span-2">
							<Input
								value={ingredient.amount}
								onChange={e => updateIngredient(index, 'amount', e.target.value)}
								placeholder="Amount"
								type="number"
								step="0.1"
							/>
						</div>
						<div className="col-span-2">
							<Input
								value={ingredient.unit}
								onChange={e => updateIngredient(index, 'unit', e.target.value)}
								placeholder="Unit"
							/>
						</div>
						<div className="col-span-4">
							<Input
								value={ingredient.name}
								onChange={e => updateIngredient(index, 'name', e.target.value)}
								placeholder="Ingredient name"
								required
							/>
						</div>
						<div className="col-span-3">
							<Input
								value={ingredient.notes}
								onChange={e => updateIngredient(index, 'notes', e.target.value)}
								placeholder="Notes (optional)"
							/>
						</div>
						<div className="col-span-1">
							<Button
								type="button"
								variant="ghost"
								className="w-full"
								onClick={() => removeIngredient(index)}
							>
								×
							</Button>
						</div>
					</div>
				))}
			</div>

			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<Label>Instructions</Label>
					<Button type="button" variant="outline" onClick={addInstruction}>
						Add Step
					</Button>
				</div>
				{instructions.map((instruction, index) => (
					<div key={index} className="flex gap-2">
						<div className="w-8 flex-shrink-0 flex items-center justify-center">{index + 1}.</div>
						<Input
							value={instruction}
							onChange={e => updateInstruction(index, e.target.value)}
							placeholder={`Step ${index + 1}`}
							required
						/>
						<Button type="button" variant="ghost" onClick={() => removeInstruction(index)}>
							×
						</Button>
					</div>
				))}
			</div>

			<div className="flex justify-end gap-4">
				<Button type="button" variant="outline" onClick={() => router.back()}>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting
						? recipeId
							? 'Saving...'
							: 'Creating...'
						: recipeId
							? 'Save Changes'
							: 'Create Recipe'}
				</Button>
			</div>
		</form>
	)
}
