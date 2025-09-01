import { TrophyIcon } from "@heroicons/react/24/outline";

export interface DisplayAchievement {
	id: number;
	name: string;
	description: string;
	targetValue: number;
	progress?: number;
	completed?: boolean;
}

export interface AchievementCardProps {
	achievement: DisplayAchievement;
}

const AchievementCard = ({ achievement }: AchievementCardProps) => {
	const progressPercentage = achievement.progress && achievement.targetValue
		? (achievement.progress / achievement.targetValue) * 100
		: 0;

	return (
		<div
			className={`p-4 border bg-white rounded-lg shadow-md flex items-start space-x-3 ${achievement.completed ? "border-2 border-yellow-400" : ""
				}`}
		>
			<TrophyIcon
				className={`w-8 h-8 mt-1 ${achievement.completed ? "text-yellow-400" : "text-gray-400"}`}
			/>
			<div className="flex-1">
				<h3 className="text-lg font-semibold text-gray-900">{achievement.name}</h3>
				<p className="text-sm text-gray-600">{achievement.description}</p>
				{achievement.progress !== undefined && (
					<div className="mt-2">
						<div className="w-full bg-gray-200 rounded-full h-2.5">
							<div
								className={`h-2.5 rounded-full ${achievement.completed ? "bg-yellow-400" : "bg-blue-500"
									}`}
								style={{ width: `${progressPercentage}%` }}
							></div>
						</div>
						<p className="text-xs text-gray-500 mt-1">
							{achievement.progress}/{achievement.targetValue}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

export default AchievementCard;
