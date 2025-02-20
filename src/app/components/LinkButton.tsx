interface LinkButtonProps {
	text: string;
	url: string;
}

export default function LinkButton({ text, url }: LinkButtonProps) {
	return (
		<div className="animate-in slide-in-from-bottom-4 fade-in duration-700 fill-mode-both delay-700">
			<a
				href={url}
				className="rounded-full bg-zinc-800 text-xl hover:bg-zinc-950 px-4 py-2 text-white"
			>
				{text}
			</a>
		</div>
	);
}
