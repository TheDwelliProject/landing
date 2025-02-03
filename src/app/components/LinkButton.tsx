interface LinkButtonProps {
  text:string;
  url: string;
};


export default function LinkButton({ text, url }: LinkButtonProps) {
  return (
    <a href={url} className="rounded-full font-semibold bg-zinc-800 hover:bg-zinc-950 px-4 py-2 text-white">
      {text}
    </a>
  );
}
