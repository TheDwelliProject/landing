import Link from "next/link";
import NavBar from "./components/NavBar";

export default function NotFound() {
	return (
		<>
			<NavBar />
			<div className="flex flex-col items-center justify-center min-h-screen">
				<h1 className="text-4xl font-bold text-zinc-800 mb-4">404</h1>
				<p className="text-zinc-600 mb-8">Page not found</p>
				<Link
					href="/"
					className="rounded-full bg-zinc-800 text-white px-4 py-2 hover:bg-zinc-950"
				>
					Go Home
				</Link>
			</div>
		</>
	);
}
