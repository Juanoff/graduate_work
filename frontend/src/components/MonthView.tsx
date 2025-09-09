import { format, addDays, startOfMonth, getDaysInMonth, isToday, isSameYear } from "date-fns";
import { ru } from "date-fns/locale";
import { Droppable } from "@/components/Droppable";
import React, { useMemo } from "react";
import { Task } from "@/types/task";
import DraggableTaskCard from "./DraggableTaskCard";
import MonthTaskCard from "./MonthTaskCard";
import { useShowToast } from "@/utils/toast";

interface MonthViewProps {
	startDate: Date;
	tasks: Task[];
	setSelectedDate: (date: string) => void;
	setIsTaskModalOpen: (isOpen: boolean) => void;
}

const MonthView = ({
	startDate,
	tasks,
	setSelectedDate,
	setIsTaskModalOpen
}: MonthViewProps) => {
	const showToast = useShowToast();
	const daysInMonth = getDaysInMonth(startDate);
	const firstDayOfMonth = startOfMonth(startDate);
	const days = useMemo(
		() => Array.from({ length: daysInMonth }, (_, i) => addDays(firstDayOfMonth, i)),
		[daysInMonth, firstDayOfMonth]
	);
	const monthLabel = isSameYear(startDate, new Date())
		? format(startDate, "MMMM", { locale: ru })
		: format(startDate, "MMMM yyyy", { locale: ru });

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

	// const busiestDay = useMemo(() => {
	// 	const taskCounts = days.map((day) => ({
	// 		date: format(day, "yyyy-MM-dd"),
	// 		count: tasks.filter(
	// 			(task) => task.dueDate && new Date(task.dueDate).toISOString().startsWith(format(day, "yyyy-MM-dd"))
	// 		).length,
	// 	}));
	// 	return taskCounts.reduce((max, curr) => (curr.count > max.count ? curr : max), { date: "", count: 0 }).date;
	// }, [days, tasks]);

	return (
		<div>
			<h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 capitalize">{monthLabel}</h2>
			<div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
				{days.map((day) => {
					const formattedDate = format(day, "yyyy-MM-dd");
					const dayTasks = dayTasksMap[formattedDate] || [];
					const displayDate = isToday(day) ? "Сегодня" : format(day, "d", { locale: ru });
					// const isBusiest = formattedDate === busiestDay && dayTasks.length > 0;

					return (
						<Droppable id={formattedDate} key={formattedDate}>
							<div
								className={`bg-white p-2 rounded-lg shadow-sm h-[140px] sm:h-[160px] ${isToday(day) ? "border-2 border-blue-500 shadow-blue-200" : ""
									} `}
							// ${isBusiest ? "animate-pulse bg-gradient-to-br from-blue-50 to-white" : ""}
							>
								<div className="sticky top-0 bg-white flex justify-between items-center">
									<h4 className="text-sm font-semibold text-gray-900">{displayDate}</h4>
									{dayTasks.length > 0 && (
										<span className="text-xs text-gray-500">{dayTasks.length}</span>
									)}
									{/* {isBusiest && (
										<span className="absolute top-1 right-1 text-red-500 animate-pulse">🔥</span>
									)} */}
								</div>

								<div className="space-y-1 mt-2 h-20 pr-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
									{dayTasks
										.map((task) => {
											if (!task.dueDate) {
												return;
											}

											const time = format(new Date(task.dueDate), "HH:mm");
											const dateTime = `${formattedDate}T${time}`

											return (
												<DraggableTaskCard
													key={task.id}
													task={task}
													component={MonthTaskCard}
													componentProps={{
														timeSlot: dateTime
													}}
												/>
											);
										})}
								</div>

								<button
									onClick={() => {
										const today = new Date();
										if (day.getTime() < today.setHours(0, 0, 0, 0)) {
											showToast("error", "Нельзя создавать задачи в прошлом");
											return;
										}
										setSelectedDate(formattedDate);
										setIsTaskModalOpen(true);
									}}
									className="text-blue-600 text-xs mt-1 hover:underline absolute bottom-2 left-2"
								>
									+ Добавить
								</button>
							</div>
						</Droppable>
					);
				})}
			</div>
		</div >
	);
};

export default React.memo(MonthView);
