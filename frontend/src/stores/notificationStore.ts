import { AccessLevel } from '@/types/task';
import { create } from 'zustand';

export enum Type {
	TASK_DEADLINE = "TASK_DEADLINE",
	TASK_INVITATION = "TASK_INVITATION",
	USER_ACHIEVEMENT = "USER_ACHIEVEMENT",
	TASK_INVITATION_RESPONSE = "TASK_INVITATION_RESPONSE",
	TASK_ACCESS_RIGHTS_CHANGED = "TASK_ACCESS_RIGHTS_CHANGED",
	TASK_ACCESS_RIGHTS_REMOVED = "TASK_ACCESS_RIGHTS_REMOVED",
}

export type Notification = {
	id: number;
	title: string;
	type: Type;
	metadata: {
		taskId?: string;
		taskTitle?: string;
		deadline?: string;
		invitationId?: string;
		username?: string;
		action?: string;
		accessLevel?: AccessLevel;
		achievementId?: string;
		achievementName?: string;
	};
	createdAt: string;
	isRead: boolean;
	isClosed: boolean;
};

interface NotificationState {
	notifications: Notification[];
	unreadCount: number;
	setNotifications: (notifications: Notification[]) => void;
	addNotification: (notification: Notification) => void;
	markAsRead: (id: number) => void;
	closeNotification: (id: number) => void;
	resetUnreadCount: () => void;
	resetNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
	notifications: [],
	unreadCount: 0,
	setNotifications: (notifications) =>
		set({
			notifications,
			unreadCount: notifications.filter((n) => !n.isRead && !n.isClosed).length,
		}),
	addNotification: (notification) =>
		set((state) => ({
			notifications: [notification, ...state.notifications],
			unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
		})),
	markAsRead: (id) =>
		set((state) => ({
			notifications: state.notifications.map((n) =>
				n.id === id ? { ...n, isRead: true } : n
			),
			unreadCount: state.notifications.filter((n) => !n.isRead && n.id !== id).length,
		})),
	closeNotification: (id) =>
		set((state) => ({
			notifications: state.notifications.map((n) =>
				n.id === id ? { ...n, isClosed: true } : n
			),
			unreadCount: state.notifications.filter((n) => !n.isClosed && !n.isRead && n.id !== id).length,
		})),
	resetUnreadCount: () => set({ unreadCount: 0 }),
	resetNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));
