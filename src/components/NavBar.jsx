import dwelliLogo from "../assets//images/dwelli_logo.svg";
export default function NavBar() {
  return (
    <nav className="items-center justify-between py-8 text-zinc-700 sm:flex">
      <a href="#">
        <img src={dwelliLogo} alt="" />
      </a>
      <div className="sm:flex">
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
