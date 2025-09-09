"use client"

import { useState, useEffect, } from "react";
import { closestCenter, DndContext, DragEndEvent, DragOverlay } from "@dnd-kit/core";
import TaskColumn, { statusStyles } from "@/components/TaskColumn";
import { StatusType, Task, Category, Priority, AccessLevel } from "@/types/task";
import {
	Dialog,
	DialogPanel,
	DialogTitle,
	Transition,
	TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";
import {
	XMarkIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import CategoryFilter from "@/components/CategoryFilter";
import { useAuth } from "@/context/useAuth";
import { useTaskStore } from "@/stores/taskStore";
import { Tooltip } from "@mui/material";
import TaskCard from "@/components/TaskCard";
import SearchAndFilter from "@/components/SearchAndFilter";
import Loading from "@/components/Loading";
import { canEditCategory } from "@/utils/permissions"
import { useShowToast } from "@/utils/toast";

export default function HomePage() {
	const auth = useAuth();
	const {
		tasks,
		filteredTasks,
		categories,
		setTasks,
		setCategories,
		addTask,
		updateTask,
		deleteTask,
		deleteCategory,
		updateCategories,
		setActiveTaskIds
	} = useTaskStore();

	const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
	const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
	const [newCategory, setNewCategory] = useState({
		name: "",
		color: "#000000",
	});
	const [editCategory, setEditCategory] = useState<Category | null>(null);
	const [newTask, setNewTask] = useState({
		title: "",
		description: "",
		status: StatusType.TO_DO,
		priority: Priority.MEDIUM,
		categoryId: null as number | null,
		dueDate: "" as string | null
	});
	const [editTask, setEditTask] = useState<Task | null>(null);
	const [activeTask, setActiveTask] = useState<Task | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const showToast = useShowToast();
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState<{
		type: "category" | "task";
		id: number;
	} | null>(null);

	// Состояние для управления включением/выключением dueDate
	const [hasDueDate, setHasDueDate] = useState<boolean>(!!newTask.dueDate);
	const [dueDateError, setDueDateError] = useState<string | null>(null);

	// Валидация dueDate при изменении
	const validateDueDate = (date: string | null) => {
		if (!date) {
			setDueDateError(null);
			return true;
		}

		const selectedDate = new Date(date);
		const now = new Date();
		if (selectedDate < now) {
			setDueDateError("Срок выполнения не может быть раньше текущего времени");
			return false;
		}
		setDueDateError(null);
		return true;
	};

	// Обновляем dueDate при изменении hasDueDate
	const handleDueDateToggle = (checked: boolean) => {
		setHasDueDate(checked);
		const updatedDueDate = checked ? newTask.dueDate || "" : null;
		setNewTask({ ...newTask, dueDate: updatedDueDate });
		validateDueDate(updatedDueDate);
	};

	// Обработка изменения dueDate
	const handleDueDateChange = (value: string) => {
		setNewTask({ ...newTask, dueDate: value });
		validateDueDate(value);
	};

	// Проверка валидности формы
	const isFormValid = () => {
		return newTask.title && (!hasDueDate || (newTask.dueDate && !dueDateError));
	};

	// Валидация при загрузке (для редактирования)
	useEffect(() => {
		if (hasDueDate && newTask.dueDate) {
			validateDueDate(newTask.dueDate);
		}
	}, [newTask.dueDate, hasDueDate]);

	// Инициализация звука при первом монтировании
	// useEffect(() => {
	// 	audioRef.current = new Audio("/sounds/notification_v2.mp3");
	// 	audioRef.current.preload = "auto"; // Предзагрузка звука
	// 	audioRef.current.volume = 0.7; // Умеренная громкость
	// 	return () => {
	// 		if (audioRef.current) {
	// 			audioRef.current.pause();
	// 			audioRef.current = null;
	// 		}
	// 	};
	// }, []);

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
					credentials: "include",
				});

				if (!res.ok) throw new Error("Ошибка загрузки категорий");

				const data = await res.json();
				setCategories(data);
			} catch (error) {
				console.error(error);
			}
		};

		fetchCategories();
	}, [setCategories]);

	useEffect(() => {
		const fetchTasks = async () => {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`, {
					credentials: "include",
				});

				if (!res.ok) throw new Error("Ошибка загрузки задачи");

				const data = await res.json();
				setTasks(data);
				setActiveTaskIds(data.map((task: Task) => task.id).filter(Boolean));
			} catch (error) {
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchTasks();
	}, [categories, setActiveTaskIds, setTasks]);

	const onDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;

		if (over) {
			const taskId = active.id;
			const newStatus = over.id as StatusType;

			const originalTask = tasks.find((task) => task.id === taskId);
			if (!originalTask) return;

			// Оптимистическое обновление
			updateTask({ ...originalTask, status: newStatus });

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}/status`, {
				method: "PATCH",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: newStatus, accessLevel: originalTask.accessLevel }),
			});

			if (!response.ok) {
				const error = await response.text();
				showToast("error", error || "Ошибка при обновлении статуса");
				// Откатываем изменения
				updateTask(originalTask);
			}

			setActiveTask(null);
		}
	};

	const updateCategoryModal = () => {
		setIsCategoryModalOpen(false);
		setTimeout(() => {
			setNewCategory({ name: "", color: "#000000" });
			setEditCategory(null);
		}, 300);
	};

	const handleAddOrUpdateCategory = async () => {
		const url = editCategory
			? `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${editCategory.id}`
			: `${process.env.NEXT_PUBLIC_API_URL}/api/categories`;

		const method = editCategory ? "PUT" : "POST";

		const response = await fetch(url, {
			method,
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(newCategory),
		});

		const updatedCategory = await response.json();

		if (editCategory) {
			updateCategories(
				categories.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat))
			);
		} else {
			updateCategories([...categories, updatedCategory]);
		}

		updateCategoryModal();
	};

	const updateTaskModal = () => {
		setIsTaskModalOpen(false);
		setTimeout(() => {
			setNewTask({
				title: "",
				description: "",
				status: StatusType.TO_DO,
				priority: Priority.MEDIUM,
				categoryId: null,
				dueDate: ""
			});
			setEditTask(null);
		}, 300);
	};

	const handleAddOrUpdateTask = async () => {
		const url = editTask
			? `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${editTask.id}`
			: `${process.env.NEXT_PUBLIC_API_URL}/api/tasks`;
		const method = editTask ? "PUT" : "POST";

		const taskData = editTask
			? { ...newTask, categoryId: newTask.categoryId || null, accessLevel: editTask.accessLevel }
			: { ...newTask, categoryId: newTask.categoryId || null, accessLevel: AccessLevel.OWNER };

		const response = await fetch(url, {
			method,
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(taskData),
		});

		const updatedTask = await response.json();
		if (updatedTask && updatedTask.categoryId !== null) {
			updatedTask.category = categories.find((cat) => cat.id === updatedTask.categoryId);
		}

		if (editTask) {
			updateTask(updatedTask);
		} else {
			addTask(updatedTask);
		}

		updateTaskModal();
	};

	const handleDeleteItem = (type: "category" | "task", id: number) => {
		setItemToDelete({ type, id });
		setIsConfirmModalOpen(true);
	};

	const confirmDeleteItem = async () => {
		if (itemToDelete) {
			if (itemToDelete.type === "category") {
				deleteCategory(itemToDelete.id);

				await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${itemToDelete.id}`, {
					method: "DELETE",
					credentials: "include",
				});
			} else if (itemToDelete.type === "task") {
				deleteTask(itemToDelete.id);

				await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${itemToDelete.id}`, {
					method: "DELETE",
					credentials: "include",
				});
			}
		}

		setIsConfirmModalOpen(false);
		setItemToDelete(null);
	};

	if (!auth || isLoading) return <Loading />;

	return (
		<div className="flex min-h-screen bg-gray-100 rounded-lg">
			{/* Панель категорий */}
			<CategoryFilter
				categories={categories}
				authUserId={auth?.user?.id ?? 0}
				setEditCategory={setEditCategory}
				setNewCategory={setNewCategory}
				setIsCategoryModalOpen={setIsCategoryModalOpen}
				handleDeleteItem={handleDeleteItem}
			/>
			{/* Панель задач */}
			<div className="flex-1 p-6">
				<div className="flex justify-between items-center mb-6 max-w-[1200px] mx-auto">
					<h1 className="text-3xl font-bold text-gray-900">Задачи</h1>
					<div className="flex gap-4">
						<button
							onClick={() => { setHasDueDate(false); setIsTaskModalOpen(true); }}
							className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-4"
							aria-label="Создать новую задачу"
						>
							Новая задача
						</button>
					</div>
				</div>

				{/* Поиск и фильтры */}
				<SearchAndFilter
					categories={categories}
				/>

				<DndContext
					collisionDetection={closestCenter}
					onDragStart={({ active }) => {
						const task = filteredTasks.find((t) => t.id === active.id);
						if (task) setActiveTask(task);
					}}
					onDragEnd={onDragEnd}
					onDragCancel={() => setActiveTask(null)}
				>
					<div className="flex gap-4 max-w-[1200px] mx-auto">
						{Object.values(StatusType).map((status) => (
							<TaskColumn
								key={status}
								status={status}
								tasks={filteredTasks.filter((task) => task.status === status)}
								onDelete={(taskId) => handleDeleteItem("task", taskId)}
								onEdit={(task) => {
									setEditTask(task);
									setNewTask({
										title: task.title,
										description: task.description || "",
										status: task.status,
										priority: task.priority,
										categoryId: task.category?.id || null,
										dueDate: task.dueDate || ""
									});
									setHasDueDate(task.dueDate ? true : false);
									setIsTaskModalOpen(true);
								}}
							/>
						))}
					</div>

					<DragOverlay>
						{activeTask ? <TaskCard
							task={activeTask}
							dragging
							onDelete={() => handleDeleteItem("task", activeTask.id!)}
							onEdit={(task) => {
								setEditTask(task);
								setNewTask({
									title: task.title,
									description: task.description || "",
									status: task.status,
									priority: task.priority,
									categoryId: task.category?.id || null,
									dueDate: task.dueDate || ""
								});
								setHasDueDate(task.dueDate ? true : false);
								setIsTaskModalOpen(true);
							}}
						/> : null
						}
					</DragOverlay>
				</DndContext>
			</div>

			{/* Модальное окно для добавления/редактирования категории */}
			<Transition appear show={isCategoryModalOpen} as={Fragment}>
				<Dialog
					as="div"
					className="relative z-10"
					onClose={() => setIsCategoryModalOpen(false)}
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
										{editCategory
											? "Редактировать категорию"
											: "Добавить категорию"}
									</DialogTitle>
									<button
										onClick={updateCategoryModal}
										className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
										aria-label="Закрыть модальное окно"
									>
										<XMarkIcon className="w-6 h-6" />
									</button>
									<div className="mt-4 space-y-4">
										<input
											type="text"
											value={newCategory.name}
											onChange={(e) =>
												setNewCategory({
													...newCategory,
													name: e.target.value,
												})
											}
											placeholder="Название категории"
											className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
										/>
										<div className="flex items-center gap-2">
											<input
												type="color"
												value={newCategory.color}
												onChange={(e) =>
													setNewCategory({
														...newCategory,
														color: e.target.value,
													})
												}
												className="w-12 h-12 border-none cursor-pointer"
											/>
											<span className="text-gray-600">{newCategory.color}</span>
										</div>
										<button
											onClick={handleAddOrUpdateCategory}
											className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
											aria-label={editCategory
												? "Сохранить новые данные для категории"
												: "Добавить новую категорию"}
										>
											{editCategory ? "Сохранить" : "Добавить"}
										</button>
									</div>
								</DialogPanel>
							</TransitionChild>
						</div>
					</div>
				</Dialog>
			</Transition>

			{/* Модальное окно для добавления/редактирования задачи */}
			<Transition appear show={isTaskModalOpen} as={Fragment}>
				<Dialog as="div" className="relative z-10" onClose={updateTaskModal}>
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
									<DialogTitle as="h2" className="text-lg font-semibold text-gray-900">
										{editTask ? "Редактировать задачу" : "Добавить задачу"}
									</DialogTitle>
									<button
										onClick={updateTaskModal}
										className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
										aria-label="Закрыть модальное окно"
									>
										<XMarkIcon className="w-6 h-6" />
									</button>
									<div className="mt-4 space-y-4">
										<input
											type="text"
											value={newTask.title}
											onChange={(e) =>
												setNewTask({ ...newTask, title: e.target.value })
											}
											placeholder="Название задачи"
											className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
											required
										/>
										<textarea
											value={newTask.description}
											onChange={(e) =>
												setNewTask({
													...newTask,
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
													value={newTask.status}
													onChange={(e) =>
														setNewTask({
															...newTask,
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
													value={newTask.priority}
													onChange={(e) =>
														setNewTask({
															...newTask,
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
										<div>
											<label
												htmlFor="taskCategory"
												className="block text-sm font-medium text-gray-700 mb-1 ml-1"
											>
												Категория
											</label>
											{editTask && !canEditCategory(editTask) ? (
												<Tooltip title={"Недоступно: нужно быть владельцем задачи"}>
													<select
														id="taskCategory"
														value={newTask.categoryId || ""}
														onChange={(e) =>
															setNewTask({
																...newTask,
																categoryId: e.target.value
																	? Number(e.target.value)
																	: null,
															})
														}
														disabled={true}
														className={
															"w-full p-2 border rounded-lg transition-all bg-gray-100 text-gray-500 cursor-not-allowed"
														}>
														<option value="">Без категории</option>
														{categories.map((category) => (
															<option key={category.id} value={category.id}>
																{category.name}
															</option>
														))}
													</select>
												</Tooltip>
											) : (
												<select
													id="taskCategory"
													value={newTask.categoryId || ""}
													onChange={(e) =>
														setNewTask({
															...newTask,
															categoryId: e.target.value
																? Number(e.target.value)
																: null,
														})
													}
													className={
														"w-full p-2 border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
													}>
													<option value="">Без категории</option>
													{categories.map((category) => (
														<option key={category.id} value={category.id}>
															{category.name}
														</option>
													))}
												</select>
											)}
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
														value={newTask.dueDate || ""}
														onChange={(e) => handleDueDateChange(e.target.value)}
														min={new Date().toISOString().slice(0, 16)}
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
											onClick={handleAddOrUpdateTask}
											className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
											disabled={!isFormValid()}
											aria-label={editTask
												? "Сохранить новые данные для задачи"
												: "Добавить новую задачу"}
										>
											{editTask ? "Сохранить" : "Добавить"}
										</button>
									</div>
								</DialogPanel>
							</TransitionChild>
						</div>
					</div>
				</Dialog>
			</Transition>

			{/* Универсальное модальное окно подтверждения */}
			<Transition appear show={isConfirmModalOpen} as={Fragment}>
				<Dialog
					as="div"
					className="relative z-50"
					onClose={() => setIsConfirmModalOpen(false)}
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
						<div className="flex min-h-full items-center justify-center p-4 text-center">
							<TransitionChild
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0 scale-95"
								enterTo="opacity-100 scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 scale-100"
								leaveTo="opacity-0 scale-95"
							>
								<DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
									<DialogTitle
										as="h3"
										className="text-lg font-medium leading-6 text-gray-900"
									>
										Подтверждение удаления
									</DialogTitle>
									<div className="mt-2">
										<p className="text-sm text-gray-500">
											Вы уверены, что хотите удалить{" "}
											{itemToDelete?.type === "category"
												? "эту категорию"
												: "эту задачу"}
											? Это действие нельзя отменить.
										</p>
									</div>

									<div className="mt-4 flex gap-4 justify-end">
										<button
											type="button"
											className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
											onClick={() => setIsConfirmModalOpen(false)}
										>
											Отмена
										</button>
										<button
											type="button"
											className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
											onClick={confirmDeleteItem}
										>
											Удалить
										</button>
									</div>
								</DialogPanel>
							</TransitionChild>
						</div>
					</div>
				</Dialog>
			</Transition>
		</div >
	);
}
