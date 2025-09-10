import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useNotificationStore } from '@/stores/notificationStore';
import { useTaskStore } from '@/stores/taskStore';
import { Type } from '@/stores/notificationStore';
import type { Notification } from '../stores/notificationStore';
import { Task } from '@/types/task';

let stompClient: Client | null = null;
let isConnected = false;
let pendingTaskIds: number[] = [];
const subscriptions: Map<number, StompSubscription> = new Map();

export const initializeWebSocket = (userId: number) => {
	if (!userId || userId === 0 || stompClient) {
		console.log('WebSocket already initialized or invalid userId: ', userId);
		return;
	}

	const socket = new SockJS(`${process.env.NEXT_PUBLIC_API_URL}/ws`, null, {
		sessionId: () => userId.toString(),
		transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
	});

	stompClient = new Client({
		webSocketFactory: () => socket,
		reconnectDelay: 5000,
		debug: (str) => console.log('[STOMP DEBUG] ' + str),
	});

	const { addNotification } = useNotificationStore.getState();
	const { updateTaskAccessLevel, deleteTask } = useTaskStore.getState();

	stompClient.onConnect = (frame) => {
		console.log(`Connected to WebSocket as user ${userId}`, frame);
		isConnected = true;

		stompClient!.subscribe(`/user/topic/notifications`, (message) => {
			try {
				const notification = JSON.parse(message.body);
				addNotification(notification);

				if (notification.type === Type.TASK_ACCESS_RIGHTS_CHANGED) {
					updateTaskAccessLevel(notification.taskId, notification.accessLevel);
				}

				if (notification.type === Type.TASK_ACCESS_RIGHTS_REMOVED) {
					deleteTask(notification.taskId);
				}

				if (Notification.permission === 'granted') {
					showBrowserNotification(notification);
				}
			} catch (e) {
				console.error('Error parsing JSON: ', e, 'Message:', message.body);
			}
		});

		// Подписываемся на отложенные taskIds после подключения
		if (pendingTaskIds.length > 0) {
			updateSubscriptions(pendingTaskIds);
		}
	};

	stompClient.onDisconnect = () => {
		console.warn('Disconnected from WebSocket. Reconnecting...');
		isConnected = false;
		subscriptions.clear();
	};

	stompClient.onStompError = (frame) => {
		console.error('STOMP error: ', frame);
	};

	stompClient.activate();

	// Начальные запросы выполняем один раз
	fetchInitialData();
}

const fetchInitialData = async () => {
	const { setNotifications } = useNotificationStore.getState();
	const { setTasks, setActiveTaskIds } = useTaskStore.getState();

	try {
		const notificationsRes = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/api/notifications?onlyOpen=true`,
			{ credentials: 'include' }
		);

		if (!notificationsRes.ok) throw new Error('Failed to fetch notifications');

		const notifications: Notification[] = await notificationsRes.json();
		setNotifications(notifications);
	} catch (error) {
		console.error('Error fetching initial notifications:', error);
	}

	try {
		const tasksRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`, {
			credentials: 'include',
		});

		if (!tasksRes.ok) throw new Error('Failed to fetch tasks');

		const tasks: Task[] = await tasksRes.json();
		setTasks(tasks);
		setActiveTaskIds(
			tasks
				.map((task: Task) => task.id)
				.filter((id): id is number => typeof id === 'number')
		);
	} catch (error) {
		console.error('Error fetching initial tasks: ', error);
	}
};

const showBrowserNotification = (notification: Notification) => {
	if (Notification.permission === 'granted' && !notification.isRead) {
		let body = '';
		switch (notification.type) {
			case Type.TASK_DEADLINE:
				body = `Срок выполнения задачи ${notification.metadata.taskTitle} закончится в ${notification.metadata.deadline}`;
				break;
			case Type.TASK_INVITATION:
				body = `Пользователь ${notification.metadata.username} пригласил вас выполнить задачу ${notification.metadata.taskTitle}`;
				break;
			case Type.USER_ACHIEVEMENT:
				body = `Вы заработали "${notification.metadata.achievementName}"`;
				break;
			case Type.TASK_INVITATION_RESPONSE:
				body = `Пользователь ${notification.metadata.username} ${notification.metadata.action} ваше приглашение на задачу ${notification.metadata.taskTitle}`;
				break;
			case Type.TASK_ACCESS_RIGHTS_CHANGED:
				body = `Ваши права для задачи ${notification.metadata.taskTitle} изменены на ${notification.metadata.accessLevel}`;
				break;
			case Type.TASK_ACCESS_RIGHTS_REMOVED:
				body = `Ваш доступ к задаче ${notification.metadata.taskTitle} был удалён`;
				break;
		}

		new Notification(notification.title, { body, icon: '/favicon.ico' });
	}
};

export const updateSubscriptions = (taskIds: number[]) => {
	if (!stompClient || !isConnected) {
		console.log('WebSocket not connected yet, subscriptions will be updated later');
		pendingTaskIds = taskIds;
		return;
	}

	console.log('Updating subscriptions for taskIds:', taskIds);

	const { updateTask } = useTaskStore.getState();

	// Отписываемся от старых подписок, которые больше не нужны
	const currentTaskIds = new Set(taskIds);
	for (const [taskId, subscription] of subscriptions) {
		if (!currentTaskIds.has(taskId)) {
			subscription.unsubscribe();
			subscriptions.delete(taskId);
			console.log(`Unsubscribed from /user/topic/task-updates/${taskId}`);
		}
	}

	taskIds.forEach((taskId) => {
		if (!subscriptions.has(taskId)) {
			const subscription = stompClient!.subscribe(`/user/topic/task-updates/${taskId}`, (message) => {
				try {
					const updatedTask = JSON.parse(message.body);
					console.log(`Received message for task ${taskId}:`, updatedTask);
					updateTask(updatedTask);
				} catch (e) {
					console.error('Error parsing task update JSON: ', e, 'Message:', message.body);
				}
			});

			subscriptions.set(taskId, subscription);
			console.log(`Subscribed to /user/topic/task-updates/${taskId}`);
		}
	});
};

export const disconnectWebSocket = () => {
	if (stompClient) {
		stompClient.deactivate().then(() => {
			console.log('WebSocket fully disconnected');
			stompClient = null;
			isConnected = false;
			pendingTaskIds = [];
			subscriptions.clear();
		}).catch((err) => {
			console.error('Error while deactivating WebSocket: ', err);
		});
	}
};
