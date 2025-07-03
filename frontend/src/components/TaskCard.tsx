"use client";

import { DraggableAttributes } from "@dnd-kit/core";
import { Task } from "@/types/task";
import { useRouter } from "next/navigation";
import {
	PencilIcon,
	TrashIcon,
	EllipsisHorizontalIcon,
	ClipboardDocumentListIcon,
	CalendarIcon,
	XCircleIcon,
} from "@heroicons/react/24/outline";
import { formatDueDate, getDueDateColor } from "@/utils/dateUtils";
import Tooltip from "@mui/material/Tooltip";
import toast from "react-hot-toast";
import { RefObject } from "react";
import debounce from "lodash/debounce";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import clsx from "clsx";

export const priorityColors: Record<string, string> = {
	LOW: "bg-green-100 text-green-800",
	MEDIUM: "bg-yellow-100 text-yellow-800",
	HIGH: "bg-red-100 text-red-800",
};

export interface TaskCardProps {
	task: Task;
	onDelete: (taskId: number) => void;
	onEdit: (taskId: Task) => void;
	dragging?: boolean;
	dragHandleRef?: RefObject<HTMLElement | null>;
	dragListeners?: SyntheticListenerMap | undefined;
	dragAttributes?: DraggableAttributes;
	isOverdue?: boolean;
	canEdit?: boolean;
	canDelete?: boolean;
	handleDragAttempt?: (e: React.MouseEvent) => void;
}

export const showOverdueToast = debounce((
	error: string,
	duration: number = 3000,
	iconSize: number = 25,
) => {
	toast.error(error, {
		duration: duration,
		style: {
			borderRadius: "12px",
			background: "#ffffff",
			color: "#1f2937",
			boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
			padding: "12px 16px",
			border: "1px solid #e5e7eb",
		},
		icon: <XCircleIcon
			style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
			className={`text-red-500 mr-2`}
		/>,
		ariaProps: { role: "alert", "aria-live": "polite" },
	});
}, 1000);

const TaskCard = ({
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
	handleDragAttempt,
}: TaskCardProps) => {
	const router = useRouter();
	const formattedDueDate = formatDueDate(task.dueDate);

	return (
		<div
			className={clsx(
				"p-4 bg-white shadow-lg rounded-lg transition-all hover:shadow-xl hover:scale-105",
				dragging && "opacity-70 scale-105"
			)}
		>
			<div className="flex justify-between items-start gap-2 flex-1">
				<div className="flex-1 min-w-0">
					<span
						ref={dragHandleRef}
						{...(isOverdue || !canEdit ? {} : { ...dragListeners, ...dragAttributes })}
						onMouseDown={handleDragAttempt}
						className={`text-base font-semibold line-clamp-2 cursor-grab`}
					>
						{task.title}
					</span>
				</div>

				<div className="flex flex-col h-full justify-between">
					<div className="flex flex-col items-end">
						<div className="flex gap-2 mt-1">
							{!canEdit ? (
								<Tooltip title={"Недоступно: требуются права на редактирование"}>
									<span>
										<button
											onClick={() => canEdit && onEdit(task)}
											disabled={!canEdit}
											className={`${canEdit
												? "text-gray-500 hover:text-blue-600"
												: "text-gray-300 cursor-not-allowed"
												} transition-colors`}
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
										className={`${canEdit
											? "text-gray-500 hover:text-blue-600"
											: "text-gray-300 cursor-not-allowed"
											} transition-colors`}
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
											className={`${canDelete
												? "text-gray-500 hover:text-red-600"
												: "text-gray-300 cursor-not-allowed"
												} transition-colors`}
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
										className={`${canDelete
											? "text-gray-500 hover:text-red-600"
											: "text-gray-300 cursor-not-allowed"
											} transition-colors`}
									>
										<TrashIcon className="w-4 h-4" />
									</button>
								</span>
							)}
						</div>
						<div className="flex items-center space-x-1 text-blue-500 mt-3 mr-1 text-sm">
							<ClipboardDocumentListIcon className="w-4 h-4" />
							<span>{task.subtasksCount}</span>
						</div>
					</div>
				</div>
			</div>

			<div className="mt-auto pt-3 flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center space-x-2 left-0">
					{task.category && (
						<span
							className={`w-3 h-3 rounded-full inline-block`}
							style={{ backgroundColor: task.category.color }}
						></span>
					)}
					<span
						className={`px-2 py-1 rounded-full text-xs font-bold ${priorityColors[task.priority]
							}`}
					>
						{task.priority}
					</span>
					<button
						onClick={(event) => {
							const url = `/task/${task.id}`;
							if (event.ctrlKey || event.metaKey) {
								window.open(url, "_blank");
							} else {
								router.push(url);
							}
						}}
						className={`text-gray-500 transition-colors ${task.category ? "ml-3" : ""
							} hover:shadow-xl hover:bg-gray-100 hover:scale-105 rounded-full`}
					>
						<EllipsisHorizontalIcon className="w-6 h-6" />
					</button>
				</div>

				{formattedDueDate && (
					<span
						className={`flex items-center ${getDueDateColor(task.dueDate)} mr-1 ${formattedDueDate.substring(0, 7) === "Сегодня" ? "animate-glow" : ""}`}
					>

						<CalendarIcon className="h-4 w-4 mr-1" />
						<span className="text-sm">{formattedDueDate}</span>
					</span>
				)}
			</div>
		</div>
	);
}

export default TaskCard;
