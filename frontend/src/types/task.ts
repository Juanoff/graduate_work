export enum StatusType {
	TO_DO = "TO_DO",
	IN_PROGRESS = "IN_PROGRESS",
	DONE = "DONE",
}

export enum Priority {
	LOW = "LOW",
	MEDIUM = "MEDIUM",
	HIGH = "HIGH",
}

export interface Category {
	id: number;
	name: string;
	color: string;
	isOwned: boolean;
}

export enum AccessLevel {
	OWNER = "OWNER",
	VIEW = "VIEW",
	EDIT = "EDIT",
}

export interface Task {
	id?: number;
	title: string;
	description?: string;
	status: StatusType;
	priority: Priority;
	parentTaskId?: number;
	subtasks?: Task[];
	categoryId?: number;
	category?: Category;
	dueDate?: string | null;
	createdAt?: string;
	completedAt?: string;
	subtasksCount?: number;
	accessLevel?: AccessLevel;
	googleEventId?: string;
	calendarId?: string;
	ownerName?: string;
}
