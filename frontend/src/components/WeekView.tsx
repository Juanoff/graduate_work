import { format, addDays, isToday, isSameYear } from "date-fns";
import { ru } from "date-fns/locale";
import { Droppable } from "@/components/Droppable";
import WeekTaskCard from "@/components/WeekTaskCard";
import React, { useMemo } from "react";
import { Task } from "@/types/task";
import DraggableTaskCard from "./DraggableTaskCard";

interface WeekViewProps {
	startDate: Date;
	tasks: Task[];
	setSelectedDate: (date: string) => void;
	setIsTaskModalOpen: (isOpen: boolean) => void;
	setEditTask: (task: Task | null) => void;
	handleDeleteItem: (type: "task", id: number) => void;
}

const WeekView = ({
	startDate,
	tasks,
	setSelectedDate,
	setIsTaskModalOpen,
	setEditTask,
	handleDeleteItem,
}: WeekViewProps) => {
	const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
	const dayTasksMap = useMemo(() => {
		const tasksByDay: { [key: string]: Task[] } = {};
		days.forEach((day) => {
			const formattedDate = format(day, "yyyy-MM-dd");
			tasksByDay[formattedDate] = tasks.filter(
				(task) =>
					task.dueDate &&
					new Date(task.dueDate).toISOString().startsWith(formattedDate)
			);
		});
		return tasksByDay;
	}, [days, tasks]);

	return (
		<div className="flex overflow-x-auto gap-4 pb-4">
			{days.map((day) => {
				const formattedDate = format(day, "yyyy-MM-dd");
				const dayTasks = dayTasksMap[formattedDate] || [];
				const displayDay = isToday(day)
					? "Сегодня"
					: format(day, "EE", { locale: ru }).slice(0, 2).toUpperCase();
				const displayDate = isSameYear(day, new Date())
					? format(day, "d MMM", { locale: ru })
					: format(day, "d MMM yyyy", { locale: ru });

				return (
					<Droppable key={formattedDate} id={formattedDate}>
						<div className="bg-white p-4 rounded-lg shadow-sm w-[280px] sm:w-[320px] min-h-[500px] sm:min-h-[600px] flex flex-col relative shrink-0">
							<div className="text-center mb-2">
								<div className="text-sm font-medium text-gray-500">{displayDay}</div>
								<div className="text-base font-semibold text-gray-900">{displayDate}</div>
							</div>
							<div className="flex-1 space-y-2 overflow-y-auto">
								{dayTasks.length === 0 ? (
									<div className="text-center text-sm text-gray-400 mt-4">Нет задач</div>
								) : (
									dayTasks.map((task) => {
										if (!task.dueDate) {
											return;
										}

										const time = format(new Date(task.dueDate), "HH:mm");
										const dateTime = `${formattedDate}T${time}`

										return (
											<DraggableTaskCard
												key={task.id}
												task={task}
												component={WeekTaskCard}
												componentProps={{
													task: task,
													timeSlot: dateTime,
													onDelete: (taskId) => handleDeleteItem("task", taskId),
													onEdit: (task) => {
														setEditTask(task);
														setIsTaskModalOpen(true);
													},
												}}
											/>
										);
									}))}
							</div>
							<button
								onClick={() => {
									const today = new Date();
									if (day.getTime() < today.setHours(0, 0, 0, 0)) {
										alert("Нельзя создавать задачи в прошлом");
										return;
									}
									setSelectedDate(formattedDate);
									setIsTaskModalOpen(true);
								}}
								className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
								aria-label="Новая задача"
							>
								Новая задача
							</button>
						</div>
					</Droppable>
				);
			})}
		</div>
	);
};

export default React.memo(WeekView);
