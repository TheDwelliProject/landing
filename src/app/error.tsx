'use client'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-zinc-800 mb-4">Something went wrong</h1>
      <p className="text-zinc-600 mb-8">An error occurred while loading this page</p>
      <button 
        onClick={reset}
        className="rounded-full bg-zinc-800 text-white px-4 py-2 hover:bg-zinc-950"
      >
        Try again
      </button>
    </div>
  )
}