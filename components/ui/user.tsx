import { User as UserIcon } from 'lucide-react'
import Image from 'next/image'

interface UserProps {
	name: string
	avatarUrl?: string | null
}

export function User({ name, avatarUrl }: UserProps) {
	return (
		<div className="flex items-center gap-2">
			<div className="relative w-8 h-8">
				{avatarUrl ? (
					<Image src={avatarUrl} alt={name} fill className="rounded-full object-cover" />
				) : (
					<div className="w-full h-full bg-muted rounded-full flex items-center justify-center">
						<UserIcon size={16} className="text-muted-foreground" />
					</div>
				)}
			</div>
			<span className="text-sm font-medium">{name}</span>
		</div>
	)
}
