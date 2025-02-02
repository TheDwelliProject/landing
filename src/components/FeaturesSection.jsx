import rentImage from "../assets/images/rent.svg";
import utilityImage from "../assets/images/utility.svg";
import issuesImage from "../assets/images/issues.svg";

export default function FeaturesSection() {
  return (
    <div className="flex w-full flex-col items-center py-56">
      {/* For Landlords */}
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="text-4xl tracking-tight text-zinc-800">
          For Landlords & Property Managers
        </h2>
        <p className="text-zinc-500">Help me here</p>
        <div className="mt-16 columns-3 gap-8 text-left">
          <div className="break-after-column rounded-2xl bg-zinc-100 p-12">
            <img
              src={rentImage}
              alt="Automated Rent Collection"
              className="mb-4 aspect-square w-full object-contain"
            />
            <h3 className="text-xl font-semibold text-zinc-800">
              Automated Rent Collection
            </h3>
            <p className="text-zinc-500">
              Get rent payments on time, every time. No more chasing tenants for
              rent.
            </p>
          </div>
          <div className="break-after-column rounded-2xl bg-zinc-100 p-12">
            <img
              src={utilityImage}
              alt="Automated Rent Collection"
              className="mb-4 aspect-square w-full object-contain"
            />
            <h3 className="text-xl font-semibold text-zinc-800">
              Maintenance Requests
            </h3>
            <p className="text-zinc-500">
              Tenants can easily submit maintenance requests online. No more
              phone calls.
            </p>
          </div>
          <div className="break-after-column rounded-2xl bg-zinc-100 p-12">
            <img
              src={issuesImage}
              alt="Automated Rent Collection"
              className="mb-4 aspect-square w-full object-contain"
            />
            <h3 className="text-xl font-semibold text-zinc-800">
              Tenant Screening
            </h3>
            <p className="text-zinc-500">
              Screen tenants online and find the best tenants for your property.
            </p>
          </div>
        </div>
      </div>
      {/* For Renters*/}
      <div className="mt-48 flex flex-col items-center gap-4 text-center">
        <h2 className="text-4xl tracking-tight text-zinc-800">For Renters</h2>
        <p className="text-zinc-500">Help me here</p>
        <div className="mt-16 columns-3 gap-8 text-left">
          <div className="break-after-column rounded-2xl bg-zinc-100 p-12">
            <img
              src={rentImage}
              alt="Automated Rent Collection"
              className="mb-4 aspect-square w-full object-contain"
            />
            <h3 className="text-xl font-semibold text-zinc-800">
              Automated Rent Collection
            </h3>
            <p className="text-zinc-500">
              Get rent payments on time, every time. No more chasing tenants for
              rent.
            </p>
          </div>
          <div className="break-after-column rounded-2xl bg-zinc-100 p-12">
            <img
              src={utilityImage}
              alt="Automated Rent Collection"
              className="mb-4 aspect-square w-full object-contain"
            />
            <h3 className="text-xl font-semibold text-zinc-800">
              Maintenance Requests
            </h3>
            <p className="text-zinc-500">
              Tenants can easily submit maintenance requests online. No more
              phone calls.
            </p>
          </div>
          <div className="break-after-column rounded-2xl bg-zinc-100 p-12">
            <img
              src={issuesImage}
              alt="Automated Rent Collection"
              className="mb-4 aspect-square w-full object-contain"
            />
            <h3 className="text-xl font-semibold text-zinc-800">
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
