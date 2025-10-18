export const metadata = {
	title: 'Textify Image',
	description: 'Convert images into text/ASCII art in your browser',
}

import './globals.css'

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="min-h-dvh bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-100 antialiased">
				<div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
					{children}
				</div>
			</body>
		</html>
	)
}
