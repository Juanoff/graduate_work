"use client"

import { useState, useMemo, Fragment } from "react";
import { closestCenter, DndContext, DragEndEvent, DragOverlay } from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { ru } from "date-fns/locale";
import { useTaskStore } from "@/stores/taskStore";
import DayView from "@/components/DayView";
import WeekView from "@/components/WeekView";
import MonthView from "@/components/MonthView";
import TaskModal from "./TaskModal";
import { Task } from "@/types/task";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import MonthTaskCard from "./MonthTaskCard";
import DayTaskCard from "./DayTaskCard";
import WeekTaskCard from "./WeekTaskCard";
import { showOverdueToast } from "./TaskCard";
import { useShowToast } from "@/utils/toast";

enum CalendarViewType {
	DAY = "DAY",
	WEEK = "WEEK",
	MONTH = "MONTH",
}

const CalendarView = () => {
	const { tasks, updateTask, updateTaskDueDate } = useTaskStore();
	const [view, setView] = useState<CalendarViewType>(CalendarViewType.WEEK);
	const [currentDate, setCurrentDate] = useState(new Date());
	const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [editTask, setEditTask] = useState<Task | null>(null);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState<{ type: "task"; id: number } | null>(null);
	const [activeTask, setActiveTask] = useState<Task | null>(null);
	const showToast = useShowToast();

	const dateRange = useMemo(() => {
		if (view === CalendarViewType.DAY) {
			return { start: currentDate, end: currentDate };
		} else if (view === CalendarViewType.WEEK) {
			return { start: startOfWeek(currentDate, { locale: ru }), end: endOfWeek(currentDate, { locale: ru }) };
		} else {
			return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
		}
	}, [view, currentDate]);

	const calendarTasks = useMemo(
		() => {
			const start = new Date(format(dateRange.start, "yyyy-MM-dd"));
			const end = new Date(format(dateRange.end, "yyyy-MM-dd"));
			end.setHours(23, 59, 59, 999);
			return tasks
				.filter((task) => {
					if (!task.dueDate) return false;
					const taskDate = new Date(task.dueDate);
					return taskDate >= start && taskDate <= end;
				})
				.sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
		}, [dateRange.end, dateRange.start, tasks]
	);

	const onDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const taskId = active.id;
			const newDateStr = over.id as string;
			const task = tasks.find((t) => t.id === taskId);

			if (task && task.dueDate) {
				const originalDueDate = new Date(task.dueDate);
				const hours = originalDueDate.getHours();
				const minutes = originalDueDate.getMinutes();

				const newDate = new Date(newDateStr);

				if (view === CalendarViewType.DAY || view === CalendarViewType.MONTH) {
					const sourceTimeSlot = active.data.current?.timeSlot;
					if (sourceTimeSlot === newDateStr) {
						setActiveTask(null);
						return;
					}
				}

				if (view === CalendarViewType.MONTH || view === CalendarViewType.WEEK) {
					newDate.setHours(hours, minutes);
				}

				const isoDueDate = format(newDate, "yyyy-MM-dd'T'HH:mm", { locale: ru });
				updateTaskDueDate(Number(taskId), isoDueDate);

				console.log("NEW ISO DUE DATE: " + isoDueDate)

				const originalTask = tasks.find((task) => task.id === taskId);
				if (!originalTask) return;

				const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}/due-date`, {
					method: "PATCH",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ dueDate: isoDueDate, accessLevel: task.accessLevel }),
				});

				if (!response.ok) {
					const error = await response.json();
					if (error.dueDate == "Due date must be in the future or present") {
						const errorMessage = "Задачи нельзя назначать на прошедшие дни. Попробуйте выбрать сегодня или позднее";
						showOverdueToast(errorMessage, 5000, 50);
					} else {
						showToast('error', "Ошибка при обновлении статуса");
					}

					updateTask(originalTask);
				}
			}

			setActiveTask(null);
		}
	};

	const handlePrev = () => {
		setCurrentDate(view === CalendarViewType.DAY ? subDays(currentDate, 1) : subDays(currentDate, view === CalendarViewType.WEEK ? 7 : 30));
	};

	const handleNext = () => {
		setCurrentDate(view === CalendarViewType.DAY ? addDays(currentDate, 1) : addDays(currentDate, view === CalendarViewType.WEEK ? 7 : 30));
	};

	const handleDeleteItem = (type: "task", id: number) => {
		setItemToDelete({ type, id });
		setIsConfirmModalOpen(true);
	};

	const confirmDeleteItem = async () => {
		if (itemToDelete) {
			try {
				await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${itemToDelete.id}`, {
					method: "DELETE",
					credentials: "include",
				});
				useTaskStore.getState().deleteTask(itemToDelete.id);
			} catch (error) {
				console.error("Failed to delete task:", error);
			}
		}

		setIsConfirmModalOpen(false);
		setItemToDelete(null);
	};

	return (
		<div className="p-4 sm:p-6 bg-gray-100 min-h-screen rounded-lg">
			<div className="max-w-7xl mx-auto">
				<div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
					<h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Календарь</h1>
					<div className="flex gap-4 items-center">
						<select
							value={view}
							onChange={(e) => setView(e.target.value as CalendarViewType)}
							className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value={CalendarViewType.DAY}>День</option>
							<option value={CalendarViewType.WEEK}>Неделя</option>
							<option value={CalendarViewType.MONTH}>Месяц</option>
						</select>
						<div className="flex gap-2">
							<button
								onClick={handlePrev}
								className="bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm shadow-sm hover:bg-gray-100"
								aria-label="Предыдущий период"
							>
								←
							</button>
							<button
								onClick={handleNext}
								className="bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm shadow-sm hover:bg-gray-100"
								aria-label="Следующий период"
							>
								→
							</button>
						</div>
					</div>
				</div>

				<DndContext
					collisionDetection={closestCenter}
					onDragStart={({ active }) => {
						const task = calendarTasks.find((t) => t.id === active.id);
						if (task) setActiveTask(task);
					}}
					onDragEnd={onDragEnd}
					onDragCancel={() => setActiveTask(null)}
				>
					<AnimatePresence>
						{view === CalendarViewType.DAY && (
							<motion.div
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
							>
								<DayView
									date={currentDate}
									tasks={calendarTasks}
									setSelectedDate={setSelectedDate}
									setIsTaskModalOpen={setIsTaskModalOpen}
									setEditTask={setEditTask}
									handleDeleteItem={handleDeleteItem}
								/>
							</motion.div>
						)}
						{view === CalendarViewType.WEEK && (
							<motion.div
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
							>
								<WeekView
									startDate={dateRange.start}
									tasks={calendarTasks}
									setSelectedDate={setSelectedDate}
									setIsTaskModalOpen={setIsTaskModalOpen}
									setEditTask={setEditTask}
									handleDeleteItem={handleDeleteItem}
								/>
							</motion.div>
						)}
						{view === CalendarViewType.MONTH && (
							<motion.div
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
							>
								<MonthView
									startDate={dateRange.start}
									tasks={calendarTasks}
									setSelectedDate={setSelectedDate}
									setIsTaskModalOpen={setIsTaskModalOpen}
								/>
							</motion.div>
						)}
					</AnimatePresence>

					{view === CalendarViewType.DAY && (<DragOverlay>
						{activeTask ? <DayTaskCard
							task={activeTask}
							dragging
							onDelete={() => handleDeleteItem("task", activeTask.id!)}
							onEdit={(activeTask) => {
								setEditTask(activeTask);
								setIsTaskModalOpen(true);
							}}
						/> : null}
					</DragOverlay>)}

					{view === CalendarViewType.WEEK && (<DragOverlay>
						{activeTask ? <WeekTaskCard
							task={activeTask}
							dragging
							onDelete={() => handleDeleteItem("task", activeTask.id!)}
							onEdit={(activeTask) => {
								setEditTask(activeTask);
								setIsTaskModalOpen(true);
							}}
						/> : null}
					</DragOverlay>)}

					{view === CalendarViewType.MONTH && (<DragOverlay>
						{activeTask ? <MonthTaskCard task={activeTask} dragging /> : null}
					</DragOverlay>)}
				</DndContext>

				{isTaskModalOpen && (
					<TaskModal
						onClose={() => {
							setIsTaskModalOpen(false);
							setEditTask(null);
						}}
						initialDate={selectedDate}
						editTask={editTask}
					/>
				)}

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
												Вы уверены, что хотите удалить эту задачу? Это действие нельзя отменить.
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
			</div>
		</div>
	);
};

export default CalendarView;
