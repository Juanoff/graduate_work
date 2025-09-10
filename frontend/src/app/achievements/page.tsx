"use client"

import { useState, useEffect, Fragment, useCallback } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { DisplayAchievement } from "@/components/AchievementCard";
import AchievementCard from "@/components/AchievementCard";
import { useAuth } from "@/hooks/useAuth";

interface Achievement {
	id: number;
	name: string;
	description: string;
	targetValue: number;
}

interface UserAchievement {
	id?: number;
	achievementId: number;
	achievementName: string;
	achievementDescription: string;
	targetValue: number;
	progress: number;
	completed: boolean;
}

export default function AchievementsPage() {
	const authContext = useAuth();
	const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [achievements, setAchievements] = useState<Achievement[]>([]);
	const [newAchievement, setNewAchievement] = useState({ name: "", description: "", targetValue: 0 });
	const [error, setError] = useState<string | null>(null);

	const fetchAchievements = useCallback(async () => {
		if (!authContext?.user || authContext.user.role !== "ADMIN") {
			setError("Только администраторы могут получать список достижений.");
			return;
		}

		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/achievements/all`, {
				credentials: "include",
			});

			if (!res.ok) throw new Error("Ошибка загрузки достижений");

			const data: Achievement[] = await res.json();
			setAchievements(data);
			setError(null);
		} catch (error) {
			console.error(error);
			setError("Не удалось загрузить достижения.");
		}
	}, [authContext?.user]);

	const fetchUserAchievements = useCallback(async () => {
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-achievements/me`, {
				credentials: "include",
			});

			if (!res.ok) throw new Error("Ошибка загрузки пользовательских достижений");

			const data: UserAchievement[] = await res.json();
			setUserAchievements(data);
			setError(null);
		} catch (error) {
			console.error(error);
			setError("Не удалось загрузить пользовательские достижения.");
		}
	}, []);

	useEffect(() => {
		const user = authContext?.user;
		if (user?.role === "USER") {
			fetchUserAchievements();
		} else if (user?.role === "ADMIN") {
			fetchAchievements();
		}
	}, [authContext?.user, fetchAchievements, fetchUserAchievements]);

	const displayAchievements: DisplayAchievement[] = authContext?.user?.role === "USER"
		? userAchievements.map((ua) => ({
			id: ua.id || ua.achievementId,
			name: ua.achievementName,
			description: ua.achievementDescription,
			targetValue: ua.targetValue,
			progress: ua.progress,
			completed: ua.completed,
		}))
		: achievements.map((a) => ({
			id: a.id,
			name: a.name,
			description: a.description,
			targetValue: a.targetValue,
			progress: 0,
			completed: false,
		}));

	const handleCreateAchievement = async () => {
		if (!authContext?.user || authContext.user.role !== "ADMIN") {
			setError("Только администраторы могут создавать достижения.");
			return;
		}

		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/achievements`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(newAchievement),
			});

			if (response.ok) {
				await fetchAchievements();
				setIsCreateModalOpen(false);
				setNewAchievement({ name: "", description: "", targetValue: 0 });
				setError(null);
			} else {
				throw new Error(`Ошибка создания достижения: ${response.status}`);
			}
		} catch (err) {
			console.log(err);
			setError("Не удалось создать достижение.");
		}
	};

	return (
		<div className="max-w-4xl mx-auto">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold text-gray-900">Достижения</h1>
				{authContext?.user?.role === "ADMIN" && (
					<button
						onClick={() => setIsCreateModalOpen(true)}
						className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
					>
						<PlusIcon className="w-5 h-5" />
						<span>Создать достижение</span>
					</button>
				)}
			</div>

			{error && (
				<div className="mb-4 p-2 bg-red-100 text-red-700 rounded-lg">
					{error}
				</div>
			)}

			{displayAchievements.length === 0 && !error ? (
				<p className="text-gray-500">Достижений пока нет.</p>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{displayAchievements.map((achievement) => (
						<AchievementCard key={achievement.id} achievement={achievement} />
					))}
				</div>
			)}

			{/* Модальное окно для создания достижения */}
			<Transition appear show={isCreateModalOpen} as={Fragment}>
				<Dialog as="div" className="relative z-10" onClose={() => setIsCreateModalOpen(false)}>
					<TransitionChild
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-black bg-opacity-25" />
					</TransitionChild>
					<div className="fixed inset-0 overflow-y-auto">
						<div className="flex min-h-full items-center justify-center p-4">
							<TransitionChild
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0 scale-95"
								enterTo="opacity-100 scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 scale-100"
								leaveTo="opacity-0 scale-95"
							>
								<DialogPanel className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
									<DialogTitle className="text-lg font-semibold text-gray-900">
										Создать новое достижение
									</DialogTitle>
									<div className="mt-4 space-y-4">
										<div>
											<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
												Название
											</label>
											<input
												id="name"
												type="text"
												value={newAchievement.name}
												onChange={(e) => setNewAchievement({ ...newAchievement, name: e.target.value })}
												className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
												required
											/>
										</div>
										<div>
											<label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
												Описание
											</label>
											<textarea
												id="description"
												value={newAchievement.description}
												onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
												className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
												required
											/>
										</div>
										<div>
											<label htmlFor="targetValue" className="block text-sm font-medium text-gray-700 mb-1">
												Целевое значение
											</label>
											<input
												id="targetValue"
												type="number"
												min="1"
												value={newAchievement.targetValue}
												onChange={(e) =>
													setNewAchievement({ ...newAchievement, targetValue: Math.max(1, Number(e.target.value)) })
												}
												className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
												required
											/>
										</div>
										<button
											onClick={handleCreateAchievement}
											className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
											disabled={!newAchievement.name || !newAchievement.description || newAchievement.targetValue < 1}
										>
											Создать
										</button>
									</div>
								</DialogPanel>
							</TransitionChild>
						</div>
					</div>
				</Dialog>
			</Transition>
		</div>
	);
}
