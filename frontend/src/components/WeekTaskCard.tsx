import { DraggableAttributes } from "@dnd-kit/core";
import { Task } from "@/types/task";
import { format } from "date-fns";
import { priorityColors } from "./TaskCard";
import Link from "next/link";
import { RefObject } from "react";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import clsx from "clsx";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "@mui/material";

interface WeekTaskCardProps {
	task: Task;
	onDelete: (taskId: number) => void;
	onEdit: (task: Task) => void;
	dragging?: boolean;
	dragHandleRef?: RefObject<HTMLElement | null>;
	dragListeners?: SyntheticListenerMap | undefined;
	dragAttributes?: DraggableAttributes;
	isOverdue?: boolean;
	canEdit?: boolean;
	canDelete?: boolean;
	handleDragAttempt?: (e: React.MouseEvent) => void;
}

const WeekTaskCard = ({
	task,
	onDelete,
	onEdit,
	dragging = false,
	dragHandleRef,
	dragListeners,
	dragAttributes,
	isOverdue,
	canEdit,
	canDelete,
	handleDragAttempt
}: WeekTaskCardProps) => {
	const dueTime = task.dueDate ? format(new Date(task.dueDate), "HH:mm") : "";

	return (
		<div
			className={clsx(
				"bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 transition-all mb-2",
				dragging && "opacity-70 scale-105"
			)}
		>
			<div className="flex items-center gap-2">
				<span className="text-xs text-gray-500">{dueTime}</span>
				<span
					ref={dragHandleRef}
					{...(isOverdue || !canEdit ? {} : { ...dragListeners, ...dragAttributes })}
					onMouseDown={handleDragAttempt}
					className="flex-1 text-sm font-semibold text-gray-800 truncate cursor-grab"
				>
					{task.title}
				</span>
			</div>
			<div className="mt-1 flex justify-between items-center">
				<div className="flex gap-2 items-center">
					{task.category && (
						<span
							className="w-3 h-3 rounded-full"
							style={{ backgroundColor: task.category.color }}
						/>
					)}
					<span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
						{task.priority}
					</span>
				</div>

				<div className="flex gap-2">
					<Link
						href={`/task/${task.id}`}
						className="text-gray-500 hover:text-gray-700 mt-1 hover:scale-110 transition duration-200 ease-in-out"
						aria-label="Перейти к задаче"
					>
						<EyeIcon className="w-4 h-4" />
					</Link>

					{!canEdit ? (
						<Tooltip title={"Недоступно: требуются права на редактирование"}>
							<span>
								<button
									onClick={() => canEdit && onEdit(task)}
									disabled={!canEdit}
									className={`hover:scale-110 transition duration-200 ease-in-out ${canEdit
										? "text-gray-500 hover:text-blue-600"
										: "text-gray-300 cursor-not-allowed"
										} transition-colors mt-1`}
								>
									<PencilIcon className="w-4 h-4" />
								</button>
							</span>
						</Tooltip>
					) : (
						<span>
							<button
								onClick={() => canEdit && onEdit(task)}
								disabled={!canEdit}
								className={`hover:scale-110 transition duration-200 ease-in-out ${canEdit
									? "text-gray-500 hover:text-blue-600"
									: "text-gray-300 cursor-not-allowed"
									} transition-colors mt-1`}
							>
								<PencilIcon className="w-4 h-4" />
							</button>
						</span>
					)}

					{!canDelete ? (
						<Tooltip title={"Недоступно: нужно быть владельцем задачи"}>
							<span>
								<button
									onClick={() => canDelete && onDelete(task.id!)}
									disabled={!canDelete}
									className={`hover:scale-110 transition duration-200 ease-in-out ${canDelete
										? "text-gray-500 hover:text-red-600"
										: "text-gray-300 cursor-not-allowed"
										} transition-colors mt-1`}
								>
									<TrashIcon className="w-4 h-4" />
								</button>
							</span>
						</Tooltip>
					) : (
						<span>
							<button
								onClick={() => canDelete && onDelete(task.id!)}
								disabled={!canDelete}
								className={`hover:scale-110 transition duration-200 ease-in-out ${canDelete
									? "text-gray-500 hover:text-red-600"
									: "text-gray-300 cursor-not-allowed"
									} transition-colors mt-1`}
							>
								<TrashIcon className="w-4 h-4" />
							</button>
						</span>
					)}
				</div>
			</div>
		</div>
	);
};

export default WeekTaskCard;
