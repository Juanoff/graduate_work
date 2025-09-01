"use client"

import { useState } from "react";
import { Transition, Dialog, DialogPanel, TransitionChild, DialogTitle } from "@headlessui/react";
import { Fragment } from "react";
import { useTaskStore } from "@/stores/taskStore";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { parse } from "date-fns";
import { format } from "date-fns-tz";
import { statusStyles } from "./TaskColumn";
import { AccessLevel, Priority, StatusType, Task } from "@/types/task";
import { ru } from "date-fns/locale";
import { Tooltip } from "@mui/material";
import { canEditCategory } from "@/utils/permissions";

interface TaskModalProps {
	onClose: () => void;
	initialDate?: string | null;
	editTask?: Task | null;
}

const TaskModal: React.FC<TaskModalProps> = ({
	onClose,
	initialDate,
	editTask
}) => {
	const { addTask, updateTask, categories } = useTaskStore();
	const initialTime = editTask?.dueDate
		? format(new Date(editTask.dueDate), "HH:mm")
		: initialDate
			? format(new Date(initialDate), "HH:mm", { timeZone: "UTC" })
			: "18:00";
	const initialDateValue = editTask?.dueDate
		? format(new Date(editTask.dueDate), "yyyy-MM-dd")
		: initialDate
			? format(new Date(initialDate), "yyyy-MM-dd")
			: "";
	const [newTask, setNewTask] = useState({
		title: editTask?.title || "",
		description: editTask?.description || "",
		status: editTask?.status || StatusType.TO_DO,
		priority: editTask?.priority || Priority.MEDIUM,
		categoryId: editTask?.categoryId || null as number | null,
		dueDate: editTask?.dueDate || initialDate || null,
	});
	const [dueTime, setDueTime] = useState(initialTime);

	const handleAddOrUpdateTask = async () => {
		if (!newTask.title || !newTask.dueDate) return;

		const dueDate = parse(
			`${format(new Date(newTask.dueDate), "yyyy-MM-dd")} ${dueTime}`,
			"yyyy-MM-dd HH:mm",
			new Date()
		);

		const taskData = {
			...newTask,
			dueDate: format(dueDate, "yyyy-MM-dd'T'HH:mm", { locale: ru }),
			categoryId: newTask.categoryId || null,
			accessLevel: editTask ? editTask.accessLevel : AccessLevel.OWNER,
		};

		const url = editTask
			? `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${editTask.id}`
			: `${process.env.NEXT_PUBLIC_API_URL}/api/tasks`;
		const method = editTask ? "PUT" : "POST";

		try {
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
		} catch (error) {
			console.error("Failed to add or update task:", error);
		}
	};

	const updateTaskModal = () => {
		setTimeout(() => {
			setNewTask({
				title: "",
				description: "",
				status: StatusType.TO_DO,
				priority: Priority.MEDIUM,
				categoryId: null,
				dueDate: null,
			});
			onClose();
		}, 300);
	};

	return (
		<Transition appear show={true} as={Fragment}>
			<Dialog
				as="div"
				className="relative z-10"
				onClose={onClose}
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
								<DialogTitle as="h2" className="text-lg font-semibold text-gray-900">
									{editTask ? "Редактировать задачу" : "Добавить задачу"}
								</DialogTitle>
								<button
									onClick={onClose}
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
												description: e.target.value
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
														status: e.target.value as StatusType
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
														priority: e.target.value as Priority
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
										<label htmlFor="taskCategory" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
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
									<div className="flex flex-col sm:flex-row gap-4">
										<div className="w-full sm:w-1/2">
											<label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
												Дата
											</label>
											<input
												type="date"
												id="dueDate"
												value={newTask.dueDate ? format(new Date(newTask.dueDate), "yyyy-MM-dd") : initialDateValue}
												min={format(new Date(), "yyyy-MM-dd")}
												onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
												className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
											/>
										</div>
										<div className="w-full sm:w-1/2">
											<label htmlFor="dueTime" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
												Время
											</label>
											<input
												type="time"
												id="dueTime"
												value={dueTime}
												onChange={(e) => setDueTime(e.target.value)}
												className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
											/>
										</div>
									</div>
									<button
										onClick={handleAddOrUpdateTask}
										className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
										disabled={!newTask.title || !newTask.dueDate}
										aria-label={editTask ? "Сохранить задачу" : "Добавить задачу"}
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
	);
};

export default TaskModal;
