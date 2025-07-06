import {
	Dialog,
	DialogBackdrop,
	DialogPanel,
	DialogTitle,
} from "@headlessui/react";

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
	return (
		<Dialog open={isOpen} onClose={onClose} className="relative z-50">
			<DialogBackdrop className="fixed inset-0 bg-black/50 animate-in fade-in duration-300" />

			<div className="fixed inset-0 flex items-center justify-center p-4">
				<DialogPanel className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full animate-in slide-in-from-bottom-4 fade-in duration-700">
					{title && (
						<div className="flex justify-between items-center mb-4">
							<DialogTitle className="text-xl font-semibold text-zinc-800">
								{title}
							</DialogTitle>
							<button
								onClick={onClose}
								className="rounded-lg p-3 hover:bg-zinc-100 text-zinc-700 cursor-pointer"
								aria-label="Close modal"
							>
								×
							</button>
						</div>
					)}

					<div className="text-zinc-700">{children}</div>
				</DialogPanel>
			</div>
		</Dialog>
	);
}
