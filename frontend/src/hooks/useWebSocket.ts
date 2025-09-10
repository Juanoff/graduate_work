import { useEffect } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { initializeWebSocket, updateSubscriptions } from '../services/websocketService';

export const useWebSocket = (userId: number) => {
	const { activeTaskIds } = useTaskStore();

	useEffect(() => {
		initializeWebSocket(userId);

		return () => {
		};
	}, [userId]);

	useEffect(() => {
		if (activeTaskIds.length > 0) {
			updateSubscriptions(activeTaskIds);
		}
	}, [activeTaskIds]); // Обновляем подписки при изменении activeTaskIds
};
