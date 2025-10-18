'use client'

export const dynamic = 'force-static'

import { useCallback, useMemo, useRef, useState } from 'react'

// Simple grayscale -> ASCII mapping
const CHARSET = ' .:-=+*#%@'

function toAscii(gray: number, charset = CHARSET) {
	const idx = Math.min(
		charset.length - 1,
		Math.floor((gray / 255) * charset.length),
	)
	return charset[idx]
}

const hexFmt = (r: number, g: number, b: number) =>
	!(r % 17 || g % 17 || b % 17)
		? `#${(r % 16).toString(16)}${(g % 16).toString(16)}${(b % 16).toString(16)}`
		: `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`

function imageToAscii(
	img: HTMLImageElement,
	opts: {
		// columns: number;
		// invert?: boolean;
		color?: boolean
	} = {
		// columns: 100,
	},
): { text: string; width: number; height: number } {
	// const { columns, invert = false } = opts
	const canvas = document.createElement('canvas')
	const ctx = canvas.getContext('2d', { willReadFrequently: true })!

	const ratio = img.height / img.width
	const width = 83
	// const width = 384
	// img.width
	// Math.max(8, Math.min(columns, img.width))
	// Approximate character aspect ratio (taller than wide)
	const height = Math.floor(width * ratio)
	// img.height
	// Math.max(4, Math.round(width * ratio * 0.5))

	console.log(width, height)

	canvas.width = width
	canvas.height = height
	ctx.imageSmoothingEnabled = true
	ctx.drawImage(img, 0, 0, width, height)

	const { data } = ctx.getImageData(0, 0, width, height)
	let out = ''
	for (let y = 0; y < height; y++) {
		// out += `{{{#!wiki style="bac}}}`
		// const chunk = 100
		const chunk = width
		const chunkCount = Math.ceil(width / chunk)

		out += `{{{#!wiki style="height:1px;display:flex"
`
		// out += `{{{#!wiki style="height:2px;display:flex"

		for (let chunkIdx = 0; chunkIdx < chunkCount; chunkIdx++) {
			let colors = []

			for (
				let x = chunkIdx * chunk;
				x < Math.min((chunkIdx + 1) * chunk, width);
				++x
			) {
				const i = (y * width + x) * 4
				const r = data[i]!
				const g = data[i + 1]!
				const b = data[i + 2]!

				const hex = hexFmt(r, g, b)

				colors.push(hex)

				// out += toAscii(gray)
			}

			out += `{{{#!wiki style="width:${Math.min(
				chunk,
				// chunk * 2,
				width - chunkIdx * chunk,
				// (width - chunkIdx * chunk) * 2,
			)}px;background:linear-gradient(90deg,${colors.join(',')})"
}}}`
		}

		out += '}}}'
	}
	return { text: out, width, height }
}

export default function Page() {
	const [ascii, setAscii] = useState<string>('')
	const [preview, setPreview] = useState<string>('')
	// const [cols, setCols] = useState<number>(100)
	// const [invert, setInvert] = useState(false)
	const [textLen, setTextLen] = useState(0)
	const fileInputRef = useRef<HTMLInputElement | null>(null)

	const onFiles = useCallback(
		(files: FileList | null) => {
			if (!files || files.length === 0) return
			const file = files.item(0)
			if (!file) return
			const url = URL.createObjectURL(file)
			setPreview(url)

			const img = new Image()
			img.onload = () => {
				try {
					const { text } = imageToAscii(img, {
						// columns: cols,
						// invert,
					})
					setAscii(text)
					setTextLen(text.length)
				} finally {
					// cleanup handled by effect below when preview changes/unmounts
				}
			}
			img.src = url
		},
		// [cols, invert],
	)

	const onDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault()
			onFiles(e.dataTransfer.files)
		},
		[onFiles],
	)

	const onPick = useCallback(() => fileInputRef.current?.click(), [])

	const copy = useCallback(async () => {
		if (!ascii) return
		await navigator.clipboard.writeText(ascii)
	}, [ascii])

	const sample = useMemo(
		() =>
			`Upload an image to generate ASCII art.\nAdjust columns and invert for different looks.`,
		[],
	)

	return (
		<main>
			<header className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">
						Textify Image
					</h1>
					<p className="mt-1 text-sm text-slate-300">
						Turn any image into ASCII text art in your browser.
					</p>
				</div>
				<a
					href="https://github.com/abiriadev/theseed-textify-img"
					target="_blank"
					className="rounded-md border border-slate-800 bg-slate-900/40 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-900"
				>
					GitHub
				</a>
			</header>

			<section className="grid gap-6 md:grid-cols-2">
				<div>
					<div
						onDrop={onDrop}
						onDragOver={e => e.preventDefault()}
						className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border border-slate-800/60 bg-slate-900/40 p-6 text-center ring-offset-0 transition hover:border-slate-700 hover:bg-slate-900"
						onClick={onPick}
					>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							hidden
							onChange={e => onFiles(e.target.files)}
						/>
						<div className="pointer-events-none">
							<div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-slate-800/70 ring-1 ring-slate-700/60">
								<svg
									className="h-7 w-7 text-slate-300"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-3-6L12 3 6 10.5m6-7.5V15"
									/>
								</svg>
							</div>
							<div className="text-sm text-slate-300">
								<p className="font-medium">Click to upload</p>
								<p className="text-slate-400">or drag & drop</p>
							</div>
						</div>
					</div>

					<div className="mt-4 grid grid-cols-2 gap-3">
						{/* <label className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/40 p-3">
							<span className="text-sm text-slate-300">
								Columns
							</span>
							<input
								className="ml-auto w-24 rounded bg-slate-800 px-2 py-1 text-right text-slate-100 outline-none ring-1 ring-slate-700"
								type="number"
								min={20}
								max={240}
								value={cols}
								onChange={e => setCols(Number(e.target.value))}
							/>
						</label> */}
						{/* <label className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/40 p-3">
							<input
								type="checkbox"
								// checked={invert}
								onChange={e => setInvert(e.target.checked)}
							/>
							<span className="text-sm text-slate-300">
								Invert
							</span>
						</label> */}
					</div>

					{preview && (
						<figure className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
							<img
								src={preview}
								alt="Preview"
								className="block max-h-[360px] w-full object-contain"
							/>
							<figcaption className="border-t border-slate-800 p-2 text-center text-xs text-slate-400">
								Preview
							</figcaption>
						</figure>
					)}
				</div>

				<div>
					<div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
						<textarea
							className="h-[520px] w-full resize-none rounded-md bg-transparent p-3 font-mono text-xs leading-[1.05rem] text-slate-200 outline-none"
							value={ascii || sample}
							readOnly
						/>
						<div className="mt-2 flex justify-end gap-2">
							<div className="flex items-center gap-4">
								<span className="text-sm text-slate-400">
									Length: {textLen}
								</span>
								<button
									onClick={copy}
									disabled={!ascii}
									className="rounded-md bg-sky-600 px-3 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
								>
									Copy to clipboard
								</button>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}
