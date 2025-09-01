"use client";

import { useDroppable } from "@dnd-kit/core";
import TaskCard from "@/components/TaskCard";
import { Task, StatusType } from "@/types/task";
import { useState } from "react";
import StatusIcon from "./StatusIcon";
import DraggableTaskCard from "./DraggableTaskCard";

interface TaskColumnProps {
	status: StatusType;
	tasks: Task[];
	onDelete: (taskId: number) => void;
	onEdit: (task: Task) => void;
}

export const statusStyles: Record<
	StatusType,
	{ title: string; color: string }
> = {
	TO_DO: { title: "В ожидании", color: "text-yellow-700" }, // bg-yellow-100
	IN_PROGRESS: { title: "В процессе", color: "text-blue-700" }, // bg-blue-100
	DONE: { title: "Завершено", color: "text-green-700" }, // bg-green-100
};

const TaskColumn = ({
	status,
	tasks,
	onDelete,
	onEdit,
}: TaskColumnProps) => {
	const { setNodeRef, isOver } = useDroppable({ id: status });
	const [isHovered, setIsHovered] = useState(false);

	return (
		<div
			ref={setNodeRef}
			className={`w-1/3 p-4 rounded-lg transition-all
	  ${isOver ? "bg-blue-100 border-2 border-blue-400" : "bg-gray-100"} 
	  ${isHovered ? "!bg-blue-50" : ""}
	`}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<div
				className={`flex items-center gap-2 px-3 py-2 rounded-lg ${statusStyles[status].color} mb-2`}
			>
				<StatusIcon status={status} />
				<h2 className="text-lg font-semibold">
					{statusStyles[status].title} ({tasks.length})
				</h2>
			</div>

			{tasks.length > 0 ? (
				<div className="space-y-4 flex-1">
					{tasks.map((task) => (
						<DraggableTaskCard
							key={task.id}
							task={task}
							component={TaskCard}
							componentProps={{
								task: task,
								onDelete: onDelete,
								onEdit: onEdit
							}}
						/>
					))}
				</div>
			) : (
				<div className="flex items-center justify-center h-screen">
					<p className="text-gray-500">Нет задач</p>
				</div>
			)}
		</div>
	);
}

export default TaskColumn;
