import dwelliLogoIcon from "../assets/images/dwelli_logo-icon.svg";
import LinkButton from "./LinkButton";

export default function HeaderSection() {
  return (
    <div className="flex w-full flex-col items-center py-24">
      <div className="flex flex-col items-center gap-4 text-center">
        <img src={dwelliLogoIcon} className="w-32" alt="" />
        <h1 className="text-6xl font-semibold tracking-tight text-zinc-800">
          Power up <br />
          your homes
        </h1>
        <p className="tracking-tight text-zinc-500">
          Simple technology for managing <br /> your home and estates
        </p>
        <LinkButton text="hey there!" url="#" />
        <p className="tracking-tigh text-sm text-zinc-400">
          We’ll let you know when we launch
        </p>
      </div>
    </div>
  );
}
