import { useState } from "react";
import Button from "./Button";

interface SignupFormProps {
	onSuccess?: () => void;
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitStatus, setSubmitStatus] = useState<
		"idle" | "success" | "error"
	>("idle");

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setSubmitStatus("idle");

		try {
			const response = await fetch("/api/signup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				setSubmitStatus("success");
				setFormData({ name: "", email: "", phone: "" });
				setTimeout(() => {
					onSuccess?.();
					setSubmitStatus("idle");
				}, 2000);
			} else {
				setSubmitStatus("error");
			}
		} catch {
			setSubmitStatus("error");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="space-y-4">
			<p className="text-sm text-zinc-600">
				Be the first to know when Dwelli launches. We&apos;ll send you
				updates about new features and availability.
			</p>

			{submitStatus === "success" && (
				<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
					<p className="text-sm text-green-800">
						Thank you for signing up! We&apos;ll be in touch soon.
					</p>
				</div>
			)}

			{submitStatus === "error" && (
				<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
					<p className="text-sm text-red-800">
						Something went wrong. Please try again.
					</p>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label
						htmlFor="name"
						className="block text-sm font-medium text-zinc-700 mb-1"
					>
						Name
					</label>
					<input
						type="text"
						id="name"
						name="name"
						value={formData.name}
						onChange={handleInputChange}
						className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-transparent"
						placeholder="Enter your name"
						required
					/>
				</div>

				<div>
					<label
						htmlFor="email"
						className="block text-sm font-medium text-zinc-700 mb-1"
					>
						Email address
					</label>
					<input
						type="email"
						id="email"
						name="email"
						value={formData.email}
						onChange={handleInputChange}
						className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-transparent"
						placeholder="Enter your email"
						required
					/>
				</div>

				<div>
					<label
						htmlFor="phone"
						className="block text-sm font-medium text-zinc-700 mb-1"
					>
						Phone number
					</label>
					<input
						type="tel"
						id="phone"
						name="phone"
						value={formData.phone}
						onChange={handleInputChange}
						className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-transparent"
						placeholder="Enter your phone number"
						required
					/>
				</div>

				<div className="flex gap-2 mt-8">
					<Button
						type="submit"
						className="flex-1 rounded-md"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Submitting..." : "Sign up"}
					</Button>
				</div>
			</form>
		</div>
	);
}
