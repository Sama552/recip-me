'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { Camera, Loader2 } from 'lucide-react'
import { CldUploadWidget } from 'next-cloudinary'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
interface Profile {
	id: string
	first_name: string | null
	last_name: string | null
	avatar_url: string | null
}

interface Props {
	user: User
	profile: Profile
}

export function AccountForm({ user, profile }: Props) {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const [firstName, setFirstName] = useState(profile?.first_name || '')
	const [lastName, setLastName] = useState(profile?.last_name || '')
	const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')

	const supabase = createClient()

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		try {
			setLoading(true)

			const { error } = await supabase
				.from('profiles')
				.update({
					first_name: firstName,
					last_name: lastName,
					avatar_url: avatarUrl,
				})
				.eq('id', user.id)

			if (error) throw error

			router.refresh()
			alert('Profile updated!')
		} catch (error) {
			console.error('Error updating profile:', error)
			alert('Error updating profile!')
		} finally {
			setLoading(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-8">
			<div className="space-y-2">
				<div className="flex items-center gap-8">
					<div className="relative">
						{avatarUrl ? (
							<Image
								src={avatarUrl}
								alt="Avatar"
								width={100}
								height={100}
								className="rounded-full object-cover"
							/>
						) : (
							<div className="w-[100px] h-[100px] bg-muted rounded-full flex items-center justify-center">
								<Camera size={40} className="text-muted-foreground" />
							</div>
						)}
						<CldUploadWidget
							uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!}
							onSuccess={({ info }) => {
								if (info && typeof info === 'object' && 'secure_url' in info) {
									setAvatarUrl(info.secure_url)
								}
							}}
						>
							{({ open }) => (
								<button
									type="button"
									className="text-sm text-muted-foreground hover:text-primary transition-colors"
									onClick={() => open()}
									disabled={loading}
								>
									Upload an image
								</button>
							)}
						</CldUploadWidget>
					</div>
					<div>
						<h2 className="text-lg font-medium">{user.email}</h2>
						<p className="text-sm text-muted-foreground">Update your profile picture</p>
					</div>
				</div>
			</div>

			<div className="grid gap-4 py-4">
				<div className="grid grid-cols-4 items-center gap-4">
					<Label htmlFor="first_name" className="text-right">
						First Name
					</Label>
					<Input
						id="first_name"
						value={firstName}
						onChange={e => setFirstName(e.target.value)}
						className="col-span-3"
					/>
				</div>
				<div className="grid grid-cols-4 items-center gap-4">
					<Label htmlFor="last_name" className="text-right">
						Last Name
					</Label>
					<Input
						id="last_name"
						value={lastName}
						onChange={e => setLastName(e.target.value)}
						className="col-span-3"
					/>
				</div>
			</div>

			<div className="flex justify-end">
				<Button type="submit" disabled={loading}>
					{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Save Changes
				</Button>
			</div>
		</form>
	)
}
