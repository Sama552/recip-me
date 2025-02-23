import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AccountForm } from './account-form'

export default async function AccountPage() {
	const supabase = await createClient()

	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		return redirect('/sign-in')
	}

	// Fetch user profile
	const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

	return (
		<div className="flex-1 w-full max-w-3xl mx-auto p-4">
			<h1 className="text-2xl font-bold mb-8">Account Settings</h1>
			<AccountForm user={user} profile={profile} />
		</div>
	)
}
