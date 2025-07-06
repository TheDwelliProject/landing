"use client";
import { useState } from "react";
import HeroAnim from "./HeroAnim";
import Button from "./Button";
import Modal from "./Modal";
import SignupForm from "./SignupForm";

export default function HeroSection() {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleSignupSuccess = () => {
		setIsModalOpen(false);
	};

	return (
		<div className="flex w-full flex-col items-center pt-16 pb-36 px-8 bg-contain bg-no-repeat bg-[center_bottom_1rem] relative">
			<HeroAnim />
			<div className="flex flex-col items-center gap-6 text-center sm:w-1/3 z-10">
				<h1 className="text-6xl sm:text-7xl font-semibold tracking-tight text-zinc-800 animate-in slide-in-from-bottom-4 fade-in duration-700 fill-mode-both delay-300">
					Power up your homes
				</h1>
				<p className="tracking-tight text-xl text-zinc-500 animate-in slide-in-from-bottom-4 fade-in duration-500 fill-mode-both delay-500">
					Easily manage bills payment, gate access, and issue
					reporting—all made simpler than ever
				</p>
				<div className="animate-in slide-in-from-bottom-4 fade-in duration-700 fill-mode-both delay-700">
					<Button
						className="rounded-full"
						size="lg"
						onClick={() => setIsModalOpen(true)}
					>
						Sign up for updates
					</Button>
				</div>
				<p className="tracking-tight text-sm text-zinc-500 animate-in slide-in-from-bottom-4 fade-in duration-700 fill-mode-both delay-900">
					We&apos;ll let you know when we launch
				</p>
			</div>

			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title="Sign up for updates"
			>
				<SignupForm onSuccess={handleSignupSuccess} />
			</Modal>
		</div>
	);
}
