import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
}

export default function Modal({
	isOpen,
	onClose,
	title,
	children,
}: ModalProps) {
	return null;
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, onClose]);

	return isOpen
		? createPortal(
				<div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300">
					<div
						className="absolute inset-0 bg-black/50"
						onClick={onClose}
					/>

					<div
						className="relative bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4 animate-in slide-in-from-bottom-4 fade-in duration-700"
						role="dialog"
						aria-modal="true"
						aria-labelledby={title ? "modal-title" : undefined}
					>
						{title && (
							<div className="flex justify-between items-center mb-4">
								<h2
									id="modal-title"
									className="text-xl font-semibold text-zinc-800"
								>
									{title}
								</h2>
								<button
									onClick={onClose}
									className="rounded-full p-2 hover:bg-zinc-100 text-zinc-700"
									aria-label="Close modal"
								>
									×
								</button>
							</div>
						)}

						<div className="text-zinc-700">{children}</div>
					</div>
				</div>,
				document.body,
			)
		: null;
}
