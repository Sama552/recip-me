import { signOutAction } from '@/app/actions'
import { User } from '@/components/ui/user'
import { hasEnvVars } from '@/utils/supabase/check-env-vars'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

export default async function AuthButton() {
	const supabase = await createClient()

	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!hasEnvVars) {
		return (
			<>
				<div className="flex gap-4 items-center">
					<div>
						<Badge variant={'default'} className="font-normal pointer-events-none">
							Please update .env.local file with anon key and url
						</Badge>
					</div>
					<div className="flex gap-2">
						<Button
							asChild
							size="sm"
							variant={'outline'}
							disabled
							className="opacity-75 cursor-none pointer-events-none"
						>
							<Link href="/sign-in">Sign in</Link>
						</Button>
						<Button
							asChild
							size="sm"
							variant={'default'}
							disabled
							className="opacity-75 cursor-none pointer-events-none"
						>
							<Link href="/sign-up">Sign up</Link>
						</Button>
					</div>
				</div>
			</>
		)
	}

	if (user) {
		// Fetch user profile
		const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

		return (
			<div className="flex items-center gap-4">
				<Link
					href="/protected/account"
					className="flex items-center gap-2 hover:text-primary transition-colors"
				>
					<User
						name={
							profile?.first_name && profile?.last_name
								? `${profile.first_name} ${profile.last_name}`
								: user.email || 'User'
						}
						avatarUrl={profile?.avatar_url}
					/>
				</Link>
				<form action={signOutAction}>
					<Button type="submit" variant={'outline'} size="sm">
						Sign out
					</Button>
				</form>
			</div>
		)
	}

	return (
		<div className="flex gap-2">
			<Button asChild size="sm" variant={'outline'}>
				<Link href="/sign-in">Sign in</Link>
			</Button>
			<Button asChild size="sm" variant={'default'}>
				<Link href="/sign-up">Sign up</Link>
			</Button>
		</div>
	)
}
