"use client";
import HeroAnim from "./HeroAnim";
import LinkButton from "./LinkButton";


export default function HeroSection() {
  return (
    <div className="flex w-full flex-col items-center pt-16 pb-36 px-8 bg-contain bg-no-repeat bg-[center_bottom_1rem] relative">
      <HeroAnim />
      <div className="flex flex-col items-center gap-4 text-center sm:w-1/3 z-10">
       
        <h1 className="text-6xl sm:text-7xl font-semibold tracking-tight text-zinc-800">
          Power up your homes
        </h1>
        <p className="tracking-tight text-xl text-zinc-500">
          Easily manage bills payment, gate access, and issue reporting—all made simpler than ever
        </p>
        <LinkButton text="Sign up for updates" url="#" />
        <p className="tracking-tight text-sm text-zinc-500">
          We’ll let you know when we launch
        </p>
      </div>
    </div>
  );
}
