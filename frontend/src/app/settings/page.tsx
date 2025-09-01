"use client";

import SettingsModal from "@/components/SettingsModal";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function SettingsPage() {
	const [isConnected, setIsConnected] = useState(false);
	const [email, setEmail] = useState("");
	const [isSyncing, setIsSyncing] = useState(false);
	const [showConfirmSync, setShowConfirmSync] = useState(false);
	const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false);
	const [lastSync, setLastSync] = useState<Date | null>(null);
	const searchParams = useSearchParams();

	useEffect(() => {
		const checkConnection = async () => {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/google/check`, {
					credentials: "include",
				});

				if (res.ok) {
					const { isConnected, email } = await res.json();
					setIsConnected(isConnected);
					setEmail(email || "");
				}
			} catch (error) {
				console.error(error);
			}
		};

		checkConnection();

		const status = searchParams.get("status");
		const message = searchParams.get("message");
		if (status === "success") {
			toast.success("Google Calendar успешно подключен");
		} else if (status === "error" && message) {
			toast.error(`Ошибка в подключении Google Calendar: ${message}`);
		}
	}, [searchParams]);

	const handleConnect = async () => {
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/google/auth?redirectBackUrl=${encodeURIComponent("http://localhost:3000/settings")}`,
				{ credentials: "include" }
			);

			if (!res.ok) throw new Error("Failed to fetch auth URL");

			const { url } = await res.json();
			window.location.href = url; // Redirect to Google OAuth
		} catch {
			toast.error("Failed to initiate Google Calendar connection");
		}
	};

	const handleSync = async () => {
		setShowConfirmSync(true);
	};

	const confirmSync = async () => {
		setShowConfirmSync(false);
		setIsSyncing(true);
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/google/sync`, {
				method: "POST",
				credentials: "include",
			});

			if (res.ok) {
				toast.success("Calendar synced successfully");
				setLastSync(new Date());
			} else {
				const error = await res.text();
				if (error.includes("Please reconnect Google Calendar")) {
					toast.error("Пожалуйста, переподключитесь Google Calendar");
					setIsConnected(false);
				} else {
					toast.error(error || "Ошибка синхронизации");
				}
			}
		} catch {
			toast.error("Ошибка синхронизации");
		} finally {
			setIsSyncing(false);
		}
	};

	const handleCancelSync = async () => {
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/google/cancel`, {
				method: "POST",
				credentials: "include",
			});
			if (res.ok) {
				toast.success("Синхронизация отклонена");
			} else {
				toast.error("Ошибка в отмене синхронизации");
			}
		} catch {
			toast.error("Ошибка в отмене синхронизации");
		} finally {
			setIsSyncing(false);
		}
	};

	const handleUndoSync = async () => {
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/google/undo`, {
				method: "POST",
				credentials: "include",
			});
			if (res.ok) {
				toast.success("Отмена синхронизации прошла успешно");
				setLastSync(null);
			} else {
				const error = await res.text();
				toast.error(error || "Undo failed");
			}
		} catch {
			toast.error("Undo failed");
		}
	};

	const handleDisconnect = async () => {
		setShowConfirmDisconnect(true);
	};

	const confirmDisconnect = async () => {
		setShowConfirmDisconnect(false);
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/google/disconnect`, {
				method: "POST",
				credentials: "include",
			});
			if (res.ok) {
				toast.success("Google Calendar успешно отключен");
				setIsConnected(false);
				setEmail("");
				setLastSync(null);
			} else {
				toast.error("Disconnect failed");
			}
		} catch {
			toast.error("Disconnect failed");
		}
	};

	const isUndoAvailable = lastSync && new Date().getTime() - lastSync.getTime() < 5 * 60 * 1000;

	return (
		<div className="p-6 max-w-[1200px] mx-auto">
			<h1 className="text-3xl font-bold text-gray-900 mb-6">Настройки</h1>
			<div className="bg-white p-6 rounded-lg shadow-md">
				<h2 className="text-xl font-semibold mb-4 text-gray-800">Google Calendar</h2>
				{isConnected ? (
					<div className="space-y-4">
						<div className="flex items-center space-x-2">
							<Image src="/g-logo.png" alt="Google" width={24} height={24} className="w-6 h-6" />
							<p className="text-gray-600">
								{" "}
								<span className="font-medium text-blue-600 hover:underline" title={email}>
									{email}
								</span>
							</p>
						</div>
						<div className="flex space-x-4">
							<button
								onClick={handleSync}
								disabled={isSyncing}
								className={`flex items-center px-4 py-2 rounded-lg text-white ${isSyncing ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
									} transition-colors`}
							>
								{isSyncing ? (
									<>
										<svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
										</svg>
										Синхронизация...
									</>
								) : (
									"Синхронизировать сейчас"
								)}
							</button>
							{isSyncing && (
								<button
									onClick={handleCancelSync}
									className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
								>
									Отклонить синхронизацию
								</button>
							)}
							{isUndoAvailable && (
								<button
									onClick={handleUndoSync}
									className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors"
								>
									Отменить последнюю синхронизацию
								</button>
							)}
							<button
								onClick={handleDisconnect}
								className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
							>
								Выйти из аккаунта
							</button>
						</div>
					</div>
				) : (
					<button
						onClick={handleConnect}
						className="flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
					>
						<Image
							src="/g-logo.png"
							alt="Google"
							width={20}
							height={20}
							className="w-5 h-5 mr-2"
						/>
						Подключить Google Calendar
					</button>
				)}
			</div>

			<SettingsModal
				isOpen={showConfirmSync}
				onClose={() => setShowConfirmSync(false)}
				title="Подтверждение синхронизации"
				message="Вы уверены, что хотите синхронизировать все задачи с Google Calendar?"
				confirmText="Да"
				onConfirm={confirmSync}
			/>

			<SettingsModal
				isOpen={showConfirmDisconnect}
				onClose={() => setShowConfirmDisconnect(false)}
				title="Подтверждение отключения"
				message="Вы уверены, что хотите выйти из аккаунта? Это приведет к отключению интеграции."
				confirmText="Да"
				confirmClassName="bg-red-600 hover:bg-red-700"
				onConfirm={confirmDisconnect}
			/>
		</div>
	);
}
