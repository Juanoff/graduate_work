import { Task } from "@/types/task";
import { DraggableAttributes } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { EyeIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import Link from "next/link";
import { RefObject } from "react";

interface MonthTaskCardProps {
	task: Task;
	dragging?: boolean;
	dragHandleRef?: RefObject<HTMLElement | null>;
	dragListeners?: SyntheticListenerMap | undefined;
	dragAttributes?: DraggableAttributes;
	isOverdue?: boolean;
	canEdit?: boolean;
	canDelete?: boolean;
	handleDragAttempt?: (e: React.MouseEvent) => void;
}

const MonthTaskCard = ({
	task,
	dragging = false,
	dragHandleRef,
	dragListeners,
	dragAttributes,
	isOverdue,
	canEdit,
	handleDragAttempt
}: MonthTaskCardProps) => {
	return (
		<div
			className={clsx(
				"bg-white p-1 rounded-md shadow-sm border border-gray-100 flex items-center gap-1 hover:bg-gray-50 transition-all mb-1",
				dragging && "opacity-70 scale-105"
			)}
		>
			<span
				ref={dragHandleRef}
				{...(isOverdue || !canEdit ? {} : { ...dragListeners, ...dragAttributes })}
				onMouseDown={handleDragAttempt}
				className="ml-1 text-xs text-gray-800 truncate flex-1 cursor-grab"
			>
				{task.title}
			</span>
			{/* {task.category && (
				<span
					className="w-2 h-2 rounded-full"
					style={{ backgroundColor: task.category.color }}
				/>
			)} */}
			<Link
				href={`/task/${task.id}`}
				className="text-gray-500 hover:text-gray-700 hover:scale-110 transition duration-200 ease-in-out"
				aria-label="Перейти к задаче"
			>
				<EyeIcon className="w-4 h-4" />
			</Link>
		</div>
	);
};

export default MonthTaskCard;
