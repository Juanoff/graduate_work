import {
	ClockIcon,
	PlayIcon,
	CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { StatusType } from "@/types/task";
import { JSX } from "react";
import clsx from "clsx";

interface StatusIconProps {
	status: StatusType;
	size?: number;
	className?: string;
}

const iconMap: Record<StatusType, JSX.Element> = {
	TO_DO: <ClockIcon />,
	IN_PROGRESS: <PlayIcon />,
	DONE: <CheckCircleIcon />,
};

const colorMap: Record<StatusType, string> = {
	TO_DO: "text-yellow-500",
	IN_PROGRESS: "text-blue-500",
	DONE: "text-green-500",
};

const StatusIcon = ({
	status,
	size = 6,
	className = "",
}: StatusIconProps) => {
	const IconComponent = iconMap[status];

	return (
		<span
			className={clsx(`w-${size}`, `h-${size}`, colorMap[status], className)}
		>
			{IconComponent}
		</span>
	);
}

export default StatusIcon;
