import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	reactStrictMode: true,
	// We keep defaults; App Router uses static rendering by default when possible.
	// For fully static export (SSG-only hosting), you can enable the following:
	// output: 'export',
	experimental: {
		turbo: {
			resolveAlias: {
				'@/*': ['./src/*'],
			},
		},
	},
}

export default nextConfig
