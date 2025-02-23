import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				hostname: 'res.cloudinary.com',
			},
		],
	},
	experimental: {
		serverActions: {
			bodySizeLimit: '10mb',
		},
	},
	/* config options here */
}

export default nextConfig
