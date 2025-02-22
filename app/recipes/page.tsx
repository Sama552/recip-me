'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function Page() {
	const [recipes, setRecipes] = useState<any[] | null>(null)
	const supabase = createClient()

	useEffect(() => {
		const getData = async () => {
			try {
				const { data, error } = await supabase.from('recipes').select('*')

				if (error) {
					throw error
				}

				console.log('Fetched data:', data) // Debug log
				setRecipes(data)
			} catch (e) {
				console.error('Error fetching recipes:', e)
			}
		}
		getData()
	}, [])

	if (!recipes) return <div>Loading...</div>

	return <pre>{JSON.stringify(recipes, null, 2)}</pre>
}
