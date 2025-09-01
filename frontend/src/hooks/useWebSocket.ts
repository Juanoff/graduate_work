import { useEffect } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { initializeWebSocket, updateSubscriptions } from './websocket';

export const useWebSocket = (userId: number) => {
	const { activeTaskIds } = useTaskStore();

	useEffect(() => {
		initializeWebSocket(userId);

		return () => {
			// Отключение при размонтировании приложения, если нужно
			// disconnectWebSocket(); // Оставьте закомментированным, если соединение должно быть постоянным
		};
	}, [userId]);

	useEffect(() => {
		if (activeTaskIds.length > 0) {
			updateSubscriptions(activeTaskIds);
		}
	}, [activeTaskIds]); // Обновляем подписки при изменении activeTaskIds
};
