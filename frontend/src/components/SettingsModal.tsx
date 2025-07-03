import { useEffect } from "react";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	message: string;
	confirmText: string;
	confirmClassName?: string;
	onConfirm: () => void;
}

export default function SettingsModal({
	isOpen,
	onClose,
	title,
	message,
	confirmText,
	confirmClassName = "bg-blue-600 hover:bg-blue-700",
	onConfirm,
}: ModalProps) {
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			document.body.style.overflow = "hidden";
		}
		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "auto";
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
				<h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
				<p className="text-gray-600 mb-6">{message}</p>
				<div className="flex justify-end space-x-3">
					<button
						onClick={onClose}
						className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
					>
						Отмена
					</button>
					<button
						onClick={onConfirm}
						className={`px-4 py-2 rounded-lg text-white ${confirmClassName} transition-colors`}
					>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	);
}
