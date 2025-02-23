import { Tag } from '@/app/types/recipe'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
	const supabase = await createClient()

	const { data, error } = await supabase.from('tags').select('id, name, created_at').order('name')

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 })
	}

	return NextResponse.json({ existingTags: data as Tag[] })
}
