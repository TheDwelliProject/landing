import dwelliLogo from "../assets//images/dwelli_logo.svg";
export default function NavBar() {
  return (
    <nav className="flex w-full items-center justify-between px-4 py-8 text-zinc-700">
      <a href="#" className="h-6">
        <img src={dwelliLogo} className="h-6" alt="" />
      </a>
      <div className="flex">
        <a
          href="#"
          className="rounded-full px-4 py-2 hover:bg-zinc-900 hover:text-white"
        >
          Landlords
        </a>
        <a
          href="#"
          className="rounded-full px-4 py-2 hover:bg-zinc-900 hover:text-white"
        >
          Renters
        </a>
        <a
          href="#"
          className="rounded-full px-4 py-2 hover:bg-zinc-900 hover:text-white"
        >
          FAQs
        </a>
      </div>
    </nav>
  );
}
