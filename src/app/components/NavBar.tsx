import Image from "next/image";
export default function NavBar() {
	return (
		<nav className="flex w-full items-center justify-around sm:justify-between px-4 py-8 text-zinc-700 animate-in fade-in delay-300 duration-700 fill-mode-both">
			<a href="#" className="h-6">
				<Image
					src="/images/dwelli_logo.svg"
					width={64}
					height={24}
					className="w-auto h-6"
					alt=""
				/>
			</a>
			<div className="sm:flex hidden">
				<a
					href="#residents"
					className="rounded-full px-4 py-2 hover:bg-zinc-900 hover:text-white"
				>
					Residents
				</a>
				<a
					href="#owners"
					className="rounded-full px-4 py-2 hover:bg-zinc-900 hover:text-white"
				>
					Owners
				</a>
				<a
					href="#faq"
					className="rounded-full px-4 py-2 hover:bg-zinc-900 hover:text-white"
				>
					FAQs
				</a>
			</div>
		</nav>
	);
}
