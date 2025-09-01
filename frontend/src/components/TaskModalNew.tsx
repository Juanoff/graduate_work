import { Category, Priority, StatusType, Task } from "@/types/task";
import { Dialog, DialogPanel, DialogTitle, Transition } from "@headlessui/react";
import { Fragment, memo, useCallback, useMemo } from "react";
import { statusStyles } from "./TaskColumn";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface TaskModalProps {
	isTaskModalOpen: boolean;
	updateTaskModal: () => void;
	newTask: Task;
	setNewTask: (task: Task) => void;
	editTask: Task | null;
	categories: Category[];
	hasDueDate: boolean;
	setHasDueDate: (value: boolean) => void;
	dueDateError: string | null;
	setDueDateError: (error: string | null) => void;
	handleAddOrUpdateTask: () => void;
	isFormValid: () => boolean | "" | null;
}

// Мемоизированный компонент для полей ввода
const TaskInputFields = memo(
	({
		title,
		description,
		onChangeTitle,
		onChangeDescription,
	}: {
		title: string;
		description?: string;
		onChangeTitle: (value: string) => void;
		onChangeDescription: (value: string) => void;
	}) => {
		console.log("Rendering TaskInputFields"); // Для отладки
		return (
			<div className="space-y-4">
				<input
					type="text"
					value={title}
					onChange={(e) => onChangeTitle(e.target.value)}
					placeholder="Название задачи"
					className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
					required
				/>
				<textarea
					value={description}
					onChange={(e) => onChangeDescription(e.target.value)}
					placeholder="Описание (опционально)"
					className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none h-24"
				/>
			</div>
		);
	}
);

TaskInputFields.displayName = "TaskInputFields";

// Мемоизированный компонент для селектов
const TaskSelectFields = memo(
	({
		status,
		priority,
		categoryId,
		categories,
		onChangeStatus,
		onChangePriority,
		onChangeCategory,
	}: {
		status: StatusType;
		priority: Priority;
		categoryId?: number | null;
		categories: Category[];
		onChangeStatus: (value: StatusType) => void;
		onChangePriority: (value: Priority) => void;
		onChangeCategory: (value: number | null) => void;
	}) => {
		console.log("Rendering TaskSelectFields"); // Для отладки
		return (
			<div className="space-y-4">
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
							value={status}
							onChange={(e) => onChangeStatus(e.target.value as StatusType)}
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
							value={priority}
							onChange={(e) => onChangePriority(e.target.value as Priority)}
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
					<select
						id="taskCategory"
						value={categoryId || ""}
						onChange={(e) =>
							onChangeCategory(e.target.value ? Number(e.target.value) : null)
						}
						className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
					>
						<option value="">Без категории</option>
						{categories.map((category) => (
							<option key={category.id} value={category.id}>
								{category.name}
							</option>
						))}
					</select>
				</div>
			</div>
		);
	}
);

TaskSelectFields.displayName = "TaskSelectFields";

// Основной компонент модального окна
const TaskModalNew = ({
	isTaskModalOpen,
	updateTaskModal,
	newTask,
	setNewTask,
	editTask,
	categories,
	hasDueDate,
	setHasDueDate,
	dueDateError,
	setDueDateError,
	handleAddOrUpdateTask,
	isFormValid,
}: TaskModalProps) => {
	// Мемоизация обработчиков
	const handleDueDateToggle = useCallback(
		(checked: boolean) => {
			setHasDueDate(checked);
			if (!checked) {
				setNewTask({ ...newTask, dueDate: null });
				setDueDateError(null);
			}
		},
		[setHasDueDate, setNewTask, setDueDateError, newTask]
	);

	const handleDueDateChange = useCallback(
		(value: string) => {
			setNewTask({ ...newTask, dueDate: value });
			if (new Date(value) < new Date()) {
				setDueDateError("Дата не может быть в прошлом");
			} else {
				setDueDateError(null);
			}
		},
		[setNewTask, setDueDateError, newTask]
	);

	// Мемоизация обработчиков для полей ввода
	const onChangeTitle = useCallback(
		(value: string) => setNewTask({ ...newTask, title: value }),
		[setNewTask, newTask]
	);
	const onChangeDescription = useCallback(
		(value: string) => setNewTask({ ...newTask, description: value }),
		[setNewTask, newTask]
	);
	const onChangeStatus = useCallback(
		(value: StatusType) => setNewTask({ ...newTask, status: value }),
		[setNewTask, newTask]
	);
	const onChangePriority = useCallback(
		(value: Priority) => setNewTask({ ...newTask, priority: value }),
		[setNewTask, newTask]
	);
	const onChangeCategory = useCallback(
		(value: number | null) => setNewTask({ ...newTask, categoryId: value || undefined }),
		[setNewTask, newTask]
	);

	// Мемоизация списка категорий
	const memoizedCategories = useMemo(() => categories, [categories]);

	return (
		<Transition appear show={isTaskModalOpen} as={Fragment}>
			<Dialog as="div" className="relative z-10" onClose={updateTaskModal}>
				<Transition
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black bg-opacity-25" />
				</Transition>
				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4">
						<Transition
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<DialogPanel className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl relative">
								<DialogTitle
									as="h2"
									className="text-lg font-semibold text-gray-900"
								>
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
									<TaskInputFields
										title={newTask.title}
										description={newTask.description}
										onChangeTitle={onChangeTitle}
										onChangeDescription={onChangeDescription}
									/>
									<TaskSelectFields
										status={newTask.status}
										priority={newTask.priority}
										categoryId={newTask.categoryId}
										categories={memoizedCategories}
										onChangeStatus={onChangeStatus}
										onChangePriority={onChangePriority}
										onChangeCategory={onChangeCategory}
									/>
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
												<span className="ml-3 text-sm font-medium text-gray-700 select-none">
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
													className={`w-full mt-2 p-2 border rounded-lg focus:outline-none focus:ring-2 ${dueDateError
														? "border-red-500 focus:ring-red-500"
														: "focus:ring-blue-500"
														} transition-all`}
												/>
												{dueDateError && (
													<p className="mt-2 text-sm text-red-600">
														{dueDateError}
													</p>
												)}
											</div>
										)}
									</div>
									<button
										onClick={handleAddOrUpdateTask}
										className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
										disabled={!isFormValid()}
									>
										{editTask ? "Сохранить" : "Добавить"}
									</button>
								</div>
							</DialogPanel>
						</Transition>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
};

export default TaskModalNew;
