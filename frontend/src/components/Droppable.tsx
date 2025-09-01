import { useDroppable } from "@dnd-kit/core";
import { ReactNode } from "react";

interface DroppableProps {
	id: string;
	children: ReactNode;
}

export const Droppable = ({ id, children }: DroppableProps) => {
	const { isOver, setNodeRef } = useDroppable({ id });

	return (
		<div
			ref={setNodeRef}
			className={`relative rounded-lg transition-all ${isOver ? "bg-blue-100 border-2 border-blue-400" : "bg-white"}`}
		>
			{children}
		</div>
	);
};
