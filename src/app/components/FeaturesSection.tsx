import Image from "next/image";
// import rentImage from "/images/rent.svg";
// import utilityImage from "/images/utility.svg";
// import issuesImage from "/images/issues.svg";

export default function FeaturesSection() {
  return (
    <div className="flex w-full flex-col items-center py-16">
      {/* For Landlords */}
      <div className="flex w-5/6 flex-col items-center gap-4 text-center">
        <h2 className="text-5xl tracking-tight text-zinc-800">
          For Landlords & Property Managers
        </h2>
        <p className="text-zinc-500">Help me here</p>
        <div className="mt-16 sm:mt-48 flex flex-col gap-8 text-left sm:flex-row">
          <div className="rounded-3xl bg-zinc-50 p-8 grow basis-0">
            <Image
              width={500}
              height={500}
              src="/images/rent.svg"
              alt="Automated Rent Collection"
              className="mb-4 aspect-square w-full object-contain"
            />
            <h3 className="text-l font-semibold text-zinc-800">
              Automated Rent Collection
            </h3>
            <p className="text-zinc-500">
              Get rent payments on time, every time. No more chasing tenants for
              rent.
            </p>
          </div>
          <div className="rounded-2xl bg-zinc-50 p-8 grow basis-0">
            <Image
              width={500}
              height={500}
              src="/images/utility.svg"
              alt="Automated Rent Collection"
              className="mb-4 aspect-square w-full object-contain"
            />
            <h3 className="text-l font-semibold text-zinc-800">
              Maintenance Requests
            </h3>
            <p className="text-zinc-500">
              Tenants can easily submit maintenance requests online. No more
              phone calls.
            </p>
          </div>
          <div className="rounded-2xl bg-zinc-50 p-8 grow basis-0">
            <Image
              width={500}
              height={500}
              src="/images/issues.svg"
              alt="Automated Rent Collection"
              className="mb-4 aspect-square w-full object-contain"
            />
            <h3 className="text-l font-semibold text-zinc-800">
              Tenant Screening
            </h3>
            <p className="text-zinc-500">
              Screen tenants online and find the best tenants for your property.
            </p>
          </div>
        </div>
      </div>
      {/* For Renters*/}
      <div className="mt-24 sm:mt-48 flex w-5/6 flex-col items-center gap-4 text-center">
        <h2 className="text-5xl tracking-tight text-zinc-800">For Renters</h2>
        <p className="text-zinc-500">Help me here</p>
        <div className="mt-16 flex flex-col gap-8 text-left sm:flex-row">
          <div className="rounded-3xl bg-zinc-50 p-8 grow basis-0">
            <Image
              width={500}
              height={500}
              src="/images/rent.svg"
              alt="Automated Rent Collection"
              className="mb-4 aspect-square w-full object-contain"
            />
            <h3 className="text-l font-semibold text-zinc-800">
              Automated Rent Collectionss
            </h3>
            <p className="text-zinc-500">
              Get rent payments on time, every time. No more chasing tenants for
              rent.
            </p>
          </div>
          <div className="rounded-2xl bg-zinc-50 p-8 grow basis-0">
            <Image
              width={500}
              height={500}
              src="/images/utility.svg"
              alt="Automated Rent Collection"
              className="mb-4 aspect-square w-full object-contain"
            />
            <h3 className="text-l font-semibold text-zinc-800">
              Maintenance Requests
            </h3>
            <p className="text-zinc-500">
              Tenants can easily submit maintenance requests online. No more
              phone calls.
            </p>
          </div>
          <div className="rounded-2xl bg-zinc-50 p-8 grow basis-0">
            <Image
              width={500}
              height={500}
              src="/images/issues.svg"
              alt="Automated Rent Collection"
              className="mb-4 aspect-square w-full object-contain"
            />
            <h3 className="text-l font-semibold text-zinc-800">
              Tenant Screening
            </h3>
            <p className="text-zinc-500">
              Screen tenants online and find the best tenants for your property.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
