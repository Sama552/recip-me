'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

type Recipe = {
	id: string
	title: string
	description: string
	prep_time: string
	cook_time: string
	servings: number
	ingredients: { name: string; amount: number; unit: string }[]
	instructions: { step_number: number; description: string }[]
}

export default function Page() {
	const [recipes, setRecipes] = useState<Recipe[] | null>(null)
	const supabase = createClient()

	useEffect(() => {
		const getData = async () => {
			try {
				const { data, error } = await supabase
					.from('recipes')
					.select(
						`
						*,
						ingredients (name, amount, unit),
						instructions (step_number, description)
					`
					)
					.order('created_at', { ascending: false })

				if (error) {
					throw error
				}

				setRecipes(data)
			} catch (e) {
				console.error('Error fetching recipes:', e)
			}
		}
		getData()
	}, [])

	if (!recipes) return <div>Loading...</div>

	return (
		<div className="w-full max-w-3xl mx-auto space-y-8">
			{recipes.map(recipe => (
				<div key={recipe.id} className="border rounded-lg p-6 space-y-4">
					<h2 className="text-2xl font-bold">{recipe.title}</h2>
					<p className="text-gray-600">{recipe.description}</p>

					<div className="flex gap-4 text-sm text-gray-500">
						<span>Prep: {recipe.prep_time}</span>
						<span>Cook: {recipe.cook_time}</span>
						<span>Serves: {recipe.servings}</span>
					</div>

					<div>
						<h3 className="font-semibold mb-2">Ingredients</h3>
						<ul className="list-disc pl-5 space-y-1">
							{recipe.ingredients?.map((ingredient, i) => (
								<li key={i}>
									{ingredient.amount} {ingredient.unit} {ingredient.name}
								</li>
							))}
						</ul>
					</div>

					<div>
						<h3 className="font-semibold mb-2">Method</h3>
						<ol className="list-decimal pl-5 space-y-2">
							{recipe.instructions
								?.sort((a, b) => a.step_number - b.step_number)
								.map((instruction, i) => <li key={i}>{instruction.description}</li>)}
						</ol>
					</div>
				</div>
			))}
		</div>
	)
}
