"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AccessLevel, Category, Priority, StatusType, Task } from "@/types/task";
import {
	Dialog,
	DialogPanel,
	DialogTitle,
	Transition,
	TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";
import { statusStyles } from "@/components/TaskColumn";
import StatusIcon from "@/components/StatusIcon";
import { CalendarIcon, ClipboardDocumentListIcon, PencilIcon, UserCircleIcon, XMarkIcon } from "@heroicons/react/24/outline"; //UsersIcon,
import {
	formatDueDate,
	getDueDateColor,
	transformDueDate,
} from "@/utils/dateUtils";
import { motion } from "framer-motion";
import InviteUsersModal from "@/components/InviteUsersModal";
import ManageAccessModal, { TaskAccess } from "@/components/ManageAccessModal";
import Image from 'next/image';
import Link from "next/link";
import ParticipantsModal from "@/components/ParticipantsModal";
import Loading from "@/components/Loading";

const priorityColors: Record<Priority, string> = {
	LOW: "bg-green-100 text-green-800",
	MEDIUM: "bg-yellow-100 text-yellow-800",
	HIGH: "bg-red-100 text-red-800",
};

export default function TaskPage() {
	const [task, setTask] = useState<Task | null>(null);
	const [newSubtask, setNewSubtask] = useState({
		title: "",
		description: "",
		status: StatusType.TO_DO,
		priority: Priority.MEDIUM,
		dueDate: "",
	});
	const [selectedSubtasks, setSelectedSubtasks] = useState<number[]>([]);
	const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
	const router = useRouter();
	const params = useParams<{ id: string }>();
	const [isShareModalOpen, setIsShareModalOpen] = useState(false);
	const [isManageAccessModalOpen, setIsManageAccessModalOpen] = useState(false);
	const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
	const [accessList, setAccessList] = useState<TaskAccess[]>([]);
	const [error, setError] = useState<string | null>(null);

	const canInvite = task?.accessLevel === AccessLevel.OWNER;
	const canEdit = task?.accessLevel === AccessLevel.OWNER || task?.accessLevel === AccessLevel.EDIT;
	const maxAvatars = 3;

	const fetchTaskAndCategory = useCallback(async () => {
		if (!params.id) return;

		try {
			const taskRes = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${params.id}`,
				{ credentials: "include" }
			);

			if (!taskRes.ok) {
				if (taskRes.status === 404) throw new Error("Задача не найдена");
				throw new Error("Ошибка загрузки задачи");
			}

			const taskData: Task = await taskRes.json();

			if (taskData.categoryId !== null) {
				const categoryRes = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${taskData.categoryId}`,
					{ credentials: "include" }
				);

				if (!categoryRes.ok) throw new Error("Ошибка загрузки категории");

				const categoryData: Category = await categoryRes.json();
				taskData.category = categoryData;
			}

			setTask(taskData);
			setError(null);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка";
			setError(errorMessage);
		}
	}, [params.id]);

	useEffect(() => {
		fetchTaskAndCategory();
	}, [fetchTaskAndCategory]);

	useEffect(() => {
		const fetchAccessList = async () => {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${params.id}/access`, {
					credentials: 'include',
				});

				if (!res.ok) throw new Error('Ошибка загрузки доступов');

				const data = await res.json();
				setAccessList(data);
			} catch (err) {
				setError('Не удалось загрузить список доступов');
				console.error(err);
			}
		};

		fetchAccessList(); //if (canInvite) 
	}, [params.id, canInvite]);

	// Состояние для управления включением/выключением dueDate
	const [hasDueDate, setHasDueDate] = useState<boolean>(!!newSubtask.dueDate);
	const [dueDateError, setDueDateError] = useState<string | null>(null);

	// Валидация dueDate при изменении
	const validateDueDate = useCallback((date: string | null) => {
		if (!date) {
			setDueDateError(null);
			return true;
		}

		const selectedDate = new Date(date);
		const now = new Date();
		if (task?.dueDate && selectedDate < now) {
			setDueDateError("Срок выполнения подзадачи не может быть в прошлом");
			return false;
		}

		if (task?.dueDate && selectedDate > new Date(task.dueDate)) {
			setDueDateError("Срок выполнения подзадачи не может быть позже основной задачи");
			return false;
		}

		setDueDateError(null);
		return true;
	}, [task?.dueDate]);

	// Обновляем dueDate при изменении hasDueDate
	const handleDueDateToggle = (checked: boolean) => {
		setHasDueDate(checked);
		const updatedDueDate = checked ? newSubtask.dueDate || "" : "";
		setNewSubtask({ ...newSubtask, dueDate: updatedDueDate });
		validateDueDate(updatedDueDate);
	};

	// Обработка изменения dueDate
	const handleDueDateChange = (value: string) => {
		setNewSubtask({ ...newSubtask, dueDate: value });
		validateDueDate(value);
	};

	// Проверка валидности формы
	const isFormValid = () => {
		return newSubtask.title && (!hasDueDate || (newSubtask.dueDate && !dueDateError));
	};

	// Валидация при загрузке (для редактирования)
	useEffect(() => {
		if (hasDueDate && newSubtask.dueDate) {
			validateDueDate(newSubtask.dueDate);
		}
	}, [newSubtask.dueDate, hasDueDate, validateDueDate]);

	if (error) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -20 }}
				transition={{ duration: 0.5, ease: "easeOut" }}
				className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900"
			>
				<div className="text-center space-y-6">
					<motion.div
						animate={{ scale: [1, 1.1, 1] }}
						transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
					>
						<svg
							className="w-24 h-24 mx-auto text-gray-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
					</motion.div>
					<h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
						{error === "Задача не найдена" ? "Задача не найдена" : "Ошибка"}
					</h1>
					<p className="text-gray-600 dark:text-gray-400 max-w-md">
						{error === "Задача не найдена"
							? "Эта задача, возможно, была удалена."
							: "Не удалось загрузить задачу."}
					</p>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={() => router.push("/")}
						className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<svg
							className="w-5 h-5 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M10 19l-7-7m0 0l7-7m-7 7h18"
							/>
						</svg>
						На главную
					</motion.button>
				</div>
			</motion.div>
		);
	}

	const updateSubtaskModal = () => {
		setIsSubtaskModalOpen(false);
		setTimeout(() => {
			setNewSubtask({
				title: "",
				description: "",
				status: StatusType.TO_DO,
				priority: Priority.MEDIUM,
				dueDate: "",
			});
		}, 300);
	};

	const handleAddSubtask = async () => {
		if (!newSubtask.title) return;

		const subtaskData = {
			...newSubtask,
			parentTaskId: parseInt(params.id, 10),
			accessLevel: AccessLevel.OWNER
		};

		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(subtaskData),
		});

		const createdSubtask = await response.json();

		setTask((prev) => ({
			...prev!,
			subtasks: [...(prev?.subtasks || []), createdSubtask],
		}));

		updateSubtaskModal();
	};

	const handleDeleteSubtasks = async () => {
		if (selectedSubtasks.length === 0) return;

		await Promise.all(
			selectedSubtasks.map((id) =>
				fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${id}`, {
					method: "DELETE",
					credentials: "include",
				})
			)
		);

		setTask((prev) => ({
			...prev!,
			subtasks: prev!.subtasks?.filter(
				(subtask) => !selectedSubtasks.includes(subtask.id ?? 0)
			),
		}));

		setSelectedSubtasks([]);
	};

	const toggleSubtaskSelection = (id: number) => {
		setSelectedSubtasks((prev) =>
			prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
		);
	};

	if (!task) {
		return <Loading />
	}

	const renderSubtasks = (subtasks: Task[], level = 0) => {
		return (
			<ul className={`ml-${level * 4} space-y-3 animate-fade-in`}>
				{subtasks.map((subtask) => (
					<li
						key={subtask.id}
						className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all border-l-2 border-gray-200"
					>
						<input
							type="checkbox"
							checked={selectedSubtasks.includes(subtask.id ?? 0)}
							onChange={() => toggleSubtaskSelection(subtask.id ?? 0)}
							disabled={!canEdit}
							className={`h-4 w-4 text-blue-600 rounded ml-2 ${!canEdit ?
								"cursor-not-allowed opacity-50" : ""}`}
						/>
						<div
							onClick={(event) => {
								const url = `/task/${subtask.id}`;
								if (event.ctrlKey || event.metaKey) {
									window.open(url, "_blank");
								} else {
									router.push(url);
								}
							}}
							className="flex-1 cursor-pointer ml-4"
						>
							<span className="font-semibold text-gray-800">
								{subtask.title}
							</span>
							<div className="flex gap-4 mt-3">
								<StatusIcon status={subtask.status} size={6} />
								<span
									className={`px-2 py-1 rounded-full text-xs font-bold ${priorityColors[subtask.priority]
										}`}
								>
									{subtask.priority}
								</span>
								{subtask.category && (
									<span
										className="text-xs text-gray-600 px-2 py-1 rounded"
										style={{ backgroundColor: `${subtask.category.color}20` }}
									>
										{subtask.category.name}
									</span>
								)}
								<div className="flex items-center space-x-1 text-gray-500 text-sm">
									<ClipboardDocumentListIcon className="w-4 h-4" />
									<span>{subtask.subtasksCount}</span>
								</div>
								{formatDueDate(subtask.dueDate) && (
									<div
										className={`flex items-center ${getDueDateColor(
											subtask.dueDate
										)}`}
									>
										<CalendarIcon className="w-4 h-4 mr-1" />
										<span className="text-sm">
											{transformDueDate(subtask.dueDate)}
										</span>
									</div>
								)}
							</div>
						</div>
					</li>
				))}
			</ul>
		);
	};

	return (
		<div className="max-w-3xl mx-auto py-8">
			<button
				onClick={() => {
					if (window.history.length > 1) {
						router.back();
					} else {
						router.push("/");
					}
				}}
				className="flex items-center text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-6 transition-colors"
			>
				<svg
					className="w-5 h-5 mr-2"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
				Назад
			</button>

			{error && <p className="text-red-500 mb-4">{error}</p>}

			<h1 className="text-3xl font-bold text-gray-900 inline-block">{task.title} <PencilIcon className="w-5 h-5 mb-1 mt-1 ml-2 inline-block" /></h1>
			<p className="text-gray-600 mt-2">{task.description || "Без описания"}</p>

			<p className="mt-4 text-gray-800">
				<strong>Статус:</strong>{" "}
				<span className="ml-1">{statusStyles[task.status].title}</span>
			</p>
			<p className="mt-2 text-gray-800">
				<strong>Приоритет:</strong>{" "}
				<span
					className={`ml-1 px-3 py-1 rounded-full text-xs font-bold ${priorityColors[task.priority]
						}`}
				>
					{task.priority}
				</span>
			</p>

			{task.category && (
				<p className="mt-2 text-gray-800 flex items-center space-x-2">
					<strong>Категория:</strong>
					<span
						className="w-3 h-3 rounded-full inline-block"
						style={{ backgroundColor: task.category.color }}
					></span>
					<span>{task.category.name}</span>
				</p>
			)}

			{task.dueDate && (
				<p className="mt-2 text-gray-800 flex items-center space-x-2">
					<strong>Дедлайн:</strong>
					<span
						className={`flex items-center space-x-1 ${getDueDateColor(
							task.dueDate
						)}`}
					>
						<CalendarIcon className="w-5 h-5" />
						<span className="text-sm font-medium">
							{transformDueDate(task.dueDate)}
						</span>
					</span>
				</p>
			)}

			{/* Аватарки пользователей */}
			{accessList.length > 0 && (
				<div className="mt-5 flex items-center gap-3">
					<div className="flex items-center gap-1">
						<span className=" text-gray-800 dark:text-gray-300">
							<strong>Участники:</strong>
						</span>
					</div>
					<div className="flex items-center gap-2">
						{accessList.slice(0, maxAvatars).map((access) => (
							<motion.div
								key={access.id}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, ease: 'easeOut' }}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="relative z-10"
							>
								<Link
									href={`/users/${access.username}`}
									aria-label={`Профиль ${access.username}`}
								>
									{access.avatar ? (
										<Image
											src={access.avatar}
											alt={access.username}
											width={36}
											height={36}
											className="rounded-full"
										/>
									) : (
										<UserCircleIcon className="w-9 h-9 text-gray-400" />
									)}
								</Link>
							</motion.div>
						))}
						{accessList.length > maxAvatars && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, ease: 'easeOut' }}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium cursor-pointer"
								onClick={() => setIsParticipantsModalOpen(true)}
							>
								+{accessList.length - maxAvatars}
							</motion.div>
						)}
					</div>
				</div>
			)}

			{canInvite && (
				<div className="mt-5 flex gap-2">
					<button
						onClick={() => setIsShareModalOpen(true)}
						className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
					>
						Пригласить
					</button>

					{accessList.length > 0 && (
						<button
							onClick={() => setIsManageAccessModalOpen(true)}
							className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
						>
							Управлять доступом
						</button>
					)}
				</div>)}

			{canInvite && (<InviteUsersModal
				isOpen={isShareModalOpen}
				onClose={() => setIsShareModalOpen(false)}
				taskId={Number(params.id)}
			/>)}

			{canInvite && (<ManageAccessModal
				isOpen={isManageAccessModalOpen}
				onClose={() => setIsManageAccessModalOpen(false)}
				taskId={Number(params.id)}
			/>)}

			<ParticipantsModal
				isOpen={isParticipantsModalOpen}
				onClose={() => setIsParticipantsModalOpen(false)}
				participants={accessList}
			/>

			<div className="mt-8">
				{canEdit && !task.parentTaskId && (<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
						Подзадачи
						{(task.subtasksCount ?? 0) > 0 && (
							<span className="bg-gray-100 text-gray-800 text-sm font-medium px-2 py-0.5 rounded-full border border-gray-300">
								{task.subtasksCount}
							</span>)}
					</h2>
					<button
						onClick={() => setIsSubtaskModalOpen(true)}
						className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
					>
						Добавить подзадачу
					</button>
				</div>)}

				{task.subtasks?.length ?? 0 > 0 ? (
					<>
						{renderSubtasks(task.subtasks ?? [])}
						{canEdit && selectedSubtasks.length > 0 && (
							<button
								onClick={handleDeleteSubtasks}
								className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
							>
								Удалить выбранные ({selectedSubtasks.length})
							</button>
						)}
					</>
				) : (
					<p className="text-gray-500 mt-2">Нет подзадач</p>
				)}
			</div>

			{/* Модальное окно для добавления подзадачи */}
			<Transition appear show={isSubtaskModalOpen} as={Fragment}>
				<Dialog
					as="div"
					className="relative z-10"
					onClose={() => setIsSubtaskModalOpen(false)}
				>
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
								<DialogPanel className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl relative">
									<DialogTitle className="text-lg font-semibold text-gray-900">
										Добавить подзадачу
									</DialogTitle>
									<button
										onClick={updateSubtaskModal}
										className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
										aria-label="Закрыть модальное окно"
									>
										<XMarkIcon className="w-6 h-6" />
									</button>
									<div className="mt-4 space-y-4">
										<input
											type="text"
											value={newSubtask.title}
											onChange={(e) =>
												setNewSubtask({ ...newSubtask, title: e.target.value })
											}
											placeholder="Название подзадачи"
											className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
										/>
										<textarea
											value={newSubtask.description}
											onChange={(e) =>
												setNewSubtask({
													...newSubtask,
													description: e.target.value,
												})
											}
											placeholder="Описание (опционально)"
											className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none h-24"
										/>
										<div className="flex flex-col sm:flex-row gap-4">
											<div className="w-full sm:w-1/2">
												<label
													htmlFor="taskStatus"
													className="block text-sm font-medium text-gray-700 mb-1 ml-1"
												>
													Статус
												</label>
												<select
													id="taskStatus"
													value={newSubtask.status}
													onChange={(e) =>
														setNewSubtask({
															...newSubtask,
															status: e.target.value as StatusType,
														})
													}
													className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
												>
													{Object.values(StatusType).map((status) => (
														<option key={status} value={status}>
															{statusStyles[status].title}
														</option>
													))}
												</select>
											</div>
											<div className="w-full sm:w-1/2">
												<label
													htmlFor="taskPriority"
													className="block text-sm font-medium text-gray-700 mb-1 ml-1"
												>
													Приоритет
												</label>
												<select
													id="taskPriority"
													value={newSubtask.priority}
													onChange={(e) =>
														setNewSubtask({
															...newSubtask,
															priority: e.target.value as Priority,
														})
													}
													className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
												>
													{Object.values(Priority).map((priority) => (
														<option key={priority} value={priority}>
															{priority}
														</option>
													))}
												</select>
											</div>
										</div>
										<div className="space-y-2">
											<div className="flex items-center">
												<label className="relative inline-flex items-center cursor-pointer">
													<input
														type="checkbox"
														id="hasDueDate"
														checked={hasDueDate}
														onChange={(e) => handleDueDateToggle(e.target.checked)}
														className="sr-only peer"
													/>
													<div className="relative w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition duration-200 ease-in-out"></div>
													<div className="w-4 h-4 mx-1 bg-white rounded-full absolute top-1 left-0.5 peer-checked:translate-x-5 peer-checked:mx-0 transition duration-200 ease-in-out"></div>
													<span className="ml-3 text-sm font-medium text-gray-700 select-none ">
														Установить срок выполнения
													</span>
												</label>
											</div>
											{hasDueDate && (
												<div>
													<input
														type="datetime-local"
														id="dueDate"
														value={newSubtask.dueDate || ""}
														onChange={(e) => handleDueDateChange(e.target.value)}
														max={task?.dueDate ? new Date(task?.dueDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)}
														className={`w-full mt-2 p-2 border rounded-lg focus:outline-none focus:ring-2 ${dueDateError ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
															} transition-all`}
													/>
													{dueDateError && (
														<p className="mt-2 text-sm text-red-600">{dueDateError}</p>
													)}
												</div>
											)}
										</div>
										<button
											onClick={handleAddSubtask}
											className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
											disabled={!isFormValid()}
											aria-label="Добавить подзадачу"
										>
											Добавить
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
