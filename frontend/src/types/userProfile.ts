export enum Role {
	USER = "USER",
	ADMIN = "ADMIN"
}

export interface UserProfile {
	id: number;
	username: string;
	email: string;
	role: Role;
	createdAt: string;
	avatarUrl?: string;
	bio?: string;
	tasksCount: number;
}

export interface UserUpdateForm {
	username?: string | undefined;
	bio?: string | null | undefined;
	email?: string | undefined;
	currentPassword?: string | undefined;
	newPassword?: string | undefined;
}
