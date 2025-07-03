"use client"

import { DraggableAttributes, useDraggable } from "@dnd-kit/core";
import { AccessLevel, Task } from "@/types/task";
import React, { ComponentType, RefObject, useState } from "react";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { showOverdueToast } from "./TaskCard";

interface DraggableTaskCardProps<T> {
	task: Task;
	component: ComponentType<
		T & {
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
	>;
	componentProps: T;
	timeSlot?: string;
}

const DraggableTaskCard = <T extends object>({
	task,
	component: Component,
	componentProps,
	timeSlot,
}: DraggableTaskCardProps<T>) => {
	const dragHandleRef: RefObject<HTMLElement | null> = React.createRef();

	const isOverdue = task.dueDate !== undefined && task.dueDate !== null && new Date(task.dueDate) < new Date();
	const [isShaking, setIsShaking] = useState(false);
	const canEdit = task.accessLevel === AccessLevel.EDIT || task.accessLevel === AccessLevel.OWNER;
	const canDelete = task.accessLevel === AccessLevel.OWNER;

	const errorForToast = !canEdit ? "Недостаточно прав для изменения статуса задачи"
		: isOverdue ? "Нельзя изменить статус просроченной задачи" : "Ошибка обновления статуса задачи";

	const handleDragAttempt = (e: React.MouseEvent) => {
		if (isOverdue || !canEdit) {
			e.preventDefault();
			setIsShaking(true);
			showOverdueToast(errorForToast);
			setTimeout(() => setIsShaking(false), 300);
		}
	};

	const {
		attributes,
		listeners,
		setNodeRef,
		isDragging,
	} = useDraggable({
		id: task.id ?? 0,
		data: timeSlot ? { timeSlot } : undefined,
		disabled: isOverdue || !task.accessLevel || task.accessLevel === AccessLevel.VIEW,
	});

	const style = {
		opacity: isDragging ? 0 : 1,
		animation: isShaking ? "shake 0.3s ease" : "none",
	};

	return (
		<div ref={setNodeRef} style={style}>
			<Component
				task={task}
				dragging={isDragging}
				dragHandleRef={dragHandleRef}
				dragListeners={listeners}
				dragAttributes={attributes}
				isOverdue={isOverdue}
				canEdit={canEdit}
				canDelete={canDelete}
				handleDragAttempt={handleDragAttempt}
				{...componentProps}
			/>
		</div>
	);
};

export default DraggableTaskCard;
