import { Recipe } from '@/app/types/recipe'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

interface RecipeUrlImportProps {
	onImportSuccess: (recipe: Partial<Recipe>) => void
	onImportError: (error: string) => void
}

export default function RecipeUrlImport({ onImportSuccess, onImportError }: RecipeUrlImportProps) {
	const [url, setUrl] = useState('')
	const [isLoading, setIsLoading] = useState(false)

	const handleImport = async () => {
		if (!url) return

		setIsLoading(true)
		try {
			const response = await fetch('/api/recipes/import', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ url }),
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Failed to import recipe')
			}

			const recipe = await response.json()
			onImportSuccess(recipe)
		} catch (error) {
			onImportError(error instanceof Error ? error.message : 'Failed to import recipe')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="flex gap-2">
			<Input
				type="url"
				placeholder="Paste recipe URL here"
				value={url}
				onChange={e => setUrl(e.target.value)}
				className="flex-1"
			/>
			<Button onClick={handleImport} disabled={!url || isLoading}>
				{isLoading ? 'Importing...' : 'Import'}
			</Button>
		</div>
	)
}
