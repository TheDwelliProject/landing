export default function MainFooter() {
	return (
		<footer className="flex w-full flex-col sm:flex-row items-center justify-between px-4 py-8 text-zinc-500">
			<div className="flex flex-col sm:flex-row gap-4 items-center">
				<svg
					width="32"
					height="32"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M19.487 2.984c2.529-3.134 7.49-.269 6.041 3.487 3.757-1.45 6.621 3.512 3.487 6.04 3.979.624 3.979 6.353 0 6.976 3.134 2.529.27 7.49-3.487 6.04 1.45 3.758-3.512 6.622-6.04 3.488-.624 3.978-6.353 3.978-6.976 0-2.529 3.134-7.49.269-6.04-3.487-3.758 1.45-6.622-3.512-3.488-6.04-3.978-.624-3.978-6.353 0-6.976-3.134-2.529-.269-7.49 3.487-6.04C5.023 2.713 9.983-.15 12.512 2.983c.623-3.978 6.352-3.978 6.975 0Z"
						fill="#E2DED9"
					/>
					<path
						d="m22.562 12.641-4.607-3.306a2.828 2.828 0 0 0-3.31 0l-4.607 3.306c-1.936 1.39-1.45 4.228.415 5.117v1.971c.01 1.919 1.529 3.47 3.401 3.47.96 0 1.827-.407 2.446-1.063a3.35 3.35 0 0 0 2.445 1.064c1.873 0 3.392-1.552 3.402-3.471v-1.971c1.865-.89 2.35-3.727.415-5.117Z"
						fill="#fff"
					/>
				</svg>

				<div className="flex">
					<a
						href="#"
						className="rounded-full px-4 py-2 hover:text-zinc-900"
					>
						Blog
					</a>
					<a
						href="#"
						className="rounded-full px-4 py-2 hover:text-zinc-900"
					>
						Email
					</a>
					<a
						href="#"
						className="rounded-full px-4 py-2 hover:text-zinc-900"
					>
						Instagram
					</a>
				</div>
			</div>
			<div className="py-4">
				<p className="text-center text-zinc-500">
					&copy; 2025 Dwelli Technologies Limited. All rights
					reserved.
				</p>
			</div>
		</footer>
	);
}
