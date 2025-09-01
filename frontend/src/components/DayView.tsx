"use client"

import { format, isToday, isSameYear } from "date-fns";
import { ru } from "date-fns/locale";
import { Droppable } from "@/components/Droppable";
import DayTaskCard from "@/components/DayTaskCard";
import React, { useMemo, useState } from "react";
import { Task } from "@/types/task";
import { AnimatePresence, motion } from "framer-motion";
import DraggableTaskCard from "./DraggableTaskCard";
import clsx from "clsx";

interface DayViewProps {
	date: Date;
	tasks: Task[];
	setSelectedDate: (date: string) => void;
	setIsTaskModalOpen: (isOpen: boolean) => void;
	setEditTask: (task: Task | null) => void;
	handleDeleteItem: (type: "task", id: number) => void;
}

const DayView = ({
	date,
	tasks,
	setSelectedDate,
	setIsTaskModalOpen,
	setEditTask,
	handleDeleteItem,
}: DayViewProps) => {
	const formattedDate = format(date, "yyyy-MM-dd");
	const dayTasks = useMemo(
		() =>
			tasks.filter(
				(task) =>
					task.dueDate &&
					new Date(task.dueDate).toISOString().startsWith(formattedDate)
			),
		[tasks, formattedDate]
	);

	const timeSlots = useMemo(
		() => Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`),
		[]
	);
	const slotTasksMap = useMemo(() => {
		const tasksBySlot: { [key: string]: Task[] } = {};
		timeSlots.forEach((time) => {
			const dateTimeId = `${formattedDate}T${time}:00`;
			tasksBySlot[dateTimeId] = dayTasks.filter(
				(task) =>
					task.dueDate && format(new Date(task.dueDate), "HH") === time.split(":")[0]
			);
		});
		return tasksBySlot;
	}, [dayTasks, timeSlots, formattedDate]);

	const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
	const [expandedSlots, setExpandedSlots] = useState<string[]>([]);
	const TASK_LIMIT = 3;

	const displayDate = isToday(date)
		? "Сегодня"
		: isSameYear(date, new Date())
			? format(date, "d MMMM", { locale: ru })
			: format(date, "d MMMM yyyy", { locale: ru });

	const toggleSlot = (slot: string) => {
		setExpandedSlots((prev) =>
			prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
		);
	};

	return (
		<div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm max-h-[calc(100vh-150px)] overflow-y-auto">
			<h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">{displayDate}</h2>
			{timeSlots.map((time) => {
				const dateTimeId = `${formattedDate}T${time}:00`;
				const slotTasks = slotTasksMap[dateTimeId] || [];
				const isExpanded = expandedSlots.includes(time);
				const visibleTasks = isExpanded ? slotTasks : slotTasks.slice(0, TASK_LIMIT);
				const hiddenTaskCount = slotTasks.length - TASK_LIMIT;

				return (<Droppable id={dateTimeId} key={time}>
					<div
						className="flex items-start relative"
						onMouseEnter={() => setHoveredSlot(time)}
						onMouseLeave={() => setHoveredSlot(null)}
					>
						<span className="w-16 sm:w-20 text-sm text-gray-500 shrink-0">{time}</span>
						<div className="flex-1 min-h-[48px] border-t border-gray-200 p-2">
							<AnimatePresence>
								<motion.div
									className="space-y-1 mr-12"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									transition={{ duration: 0.1 }}
								>
									{visibleTasks.map((task) => (
										<DraggableTaskCard
											key={task.id}
											task={task}
											component={DayTaskCard}
											componentProps={{
												task: task,
												onDelete: () => handleDeleteItem("task", task.id!),
												onEdit: (task) => {
													setEditTask(task);
													setIsTaskModalOpen(true);
												},
											}}
											timeSlot={dateTimeId}
										/>
									))}
									{slotTasks.length > TASK_LIMIT && (
										<motion.button
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											className="bg-white shadow-sm rounded-full hover:text-blue-600 text-xs p-2 border-t border-gray-200 hover:bg-gray-50 transition-all"
											onClick={() => toggleSlot(time)}
											aria-label={isExpanded ? "Скрыть задачи" : `Показать ещё ${hiddenTaskCount} задач`}
											aria-expanded={isExpanded}
										>
											{isExpanded ? "Скрыть" : `+${hiddenTaskCount}`}
										</motion.button>
									)}
								</motion.div>
							</AnimatePresence>
							{hoveredSlot === time && (
								<button
									className={clsx("absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm hover:bg-blue-700 transition-all",
										slotTasks.length > 1 ? "mt-1" : ""
									)}
									onClick={() => {
										const today = new Date();
										if (new Date(dateTimeId).getTime() < today.setHours(0, 0, 0, 0)) {
											alert("Нельзя создавать задачи в прошлом");
											return;
										}
										setSelectedDate(dateTimeId);
										setIsTaskModalOpen(true);
									}}
									aria-label="Добавить задачу"
								>
									+
								</button>
							)}
						</div>
					</div>
				</Droppable>
				);
			})}
		</div>
	);
};

export default React.memo(DayView);
