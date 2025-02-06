import Image from "next/image";
export default function FeaturesSection() {
	return (
		<div
			className="flex w-full flex-col items-center py-16 animate-in slide-in-from-bottom-8 fade-in duration-700 fill-mode-both delay-1500"
			id="residents"
		>
			<div className="flex w-5/6 flex-col items-center gap-4 text-center">
				<h2 className="text-5xl tracking-tight text-zinc-800">
					For Residents
				</h2>
				<p className="text-zinc-500">Help me here</p>
				<div className="mt-16 flex flex-col gap-8 text-left sm:flex-row">
					<div className="grow basis-0">
						<div className="bg-zinc-50 w-full rounded-3xl">
							<Image
								width={500}
								height={500}
								src="/images/manage.png"
								alt="Automated Rent Collection"
								className="mb-4 aspect-square w-full object-contain"
							/>
						</div>

						<div className="px-4">
							<h3 className="text-l font-semibold text-zinc-800">
								Automated Rent Collection
							</h3>
							<p className="text-zinc-500">
								Get rent payments on time, every time. No more
								chasing tenants for rent.
							</p>
						</div>
					</div>
					<div className="grow basis-0">
						<div className="bg-zinc-50 w-full rounded-3xl">
							<Image
								width={500}
								height={500}
								src="/images/access.png"
								alt="Automated Rent Collection"
								className="mb-4 aspect-square w-full object-contain"
							/>
						</div>

						<div className="px-4">
							<h3 className="text-l font-semibold text-zinc-800">
								Automated Rent Collection
							</h3>
							<p className="text-zinc-500">
								Get rent payments on time, every time. No more
								chasing tenants for rent.
							</p>
						</div>
					</div>
					<div className="grow basis-0">
						<div className="bg-zinc-50 w-full rounded-3xl">
							<Image
								width={500}
								height={500}
								src="/images/payments.png"
								alt="Automated Rent Collection"
								className="mb-4 aspect-square w-full object-contain"
							/>
						</div>

						<div className="px-4">
							<h3 className="text-l font-semibold text-zinc-800">
								Automated Rent Collection
							</h3>
							<p className="text-zinc-500">
								Get rent payments on time, every time. No more
								chasing tenants for rent.
							</p>
						</div>
					</div>
				</div>
			</div>
			<div
				className="mt-24 sm:mt-48 flex w-5/6 flex-col items-center gap-4 text-center"
				id="owners"
			>
				<h2 className="text-5xl tracking-tight text-zinc-800">
					For Property Owners & Managers
				</h2>
				<p className="text-zinc-500">Help me here</p>
				<div className="mt-16 flex flex-col gap-8 text-left sm:flex-row">
					<div className="grow basis-0">
						<div className="bg-zinc-50 w-full rounded-3xl">
							<Image
								width={500}
								height={500}
								src="/images/manage.png"
								alt="Automated Rent Collection"
								className="mb-4 aspect-square w-full object-contain"
							/>
						</div>

						<div className="px-4">
							<h3 className="text-l font-semibold text-zinc-800">
								Automated Rent Collection
							</h3>
							<p className="text-zinc-500">
								Get rent payments on time, every time. No more
								chasing tenants for rent.
							</p>
						</div>
					</div>
					<div className="grow basis-0">
						<div className="bg-zinc-50 w-full rounded-3xl">
							<Image
								width={500}
								height={500}
								src="/images/access.png"
								alt="Automated Rent Collection"
								className="mb-4 aspect-square w-full object-contain"
							/>
						</div>

						<div className="px-4">
							<h3 className="text-l font-semibold text-zinc-800">
								Automated Rent Collection
							</h3>
							<p className="text-zinc-500">
								Get rent payments on time, every time. No more
								chasing tenants for rent.
							</p>
						</div>
					</div>
					<div className="grow basis-0">
						<div className="bg-zinc-50 w-full rounded-3xl">
							<Image
								width={500}
								height={500}
								src="/images/payments.png"
								alt="Automated Rent Collection"
								className="mb-4 aspect-square w-full object-contain"
							/>
						</div>

						<div className="px-4">
							<h3 className="text-l font-semibold text-zinc-800">
								Automated Rent Collection
							</h3>
							<p className="text-zinc-500">
								Get rent payments on time, every time. No more
								chasing tenants for rent.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
