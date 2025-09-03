"use client";

import { useAuth } from '@/context/useAuth';
import { Type, Notification, useNotificationStore } from '../stores/notificationStore';
import { XMarkIcon } from "@heroicons/react/24/outline";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import Link from 'next/link';
import { useState } from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

const NotificationsDropdown = ({ onClose }: { onClose: () => void }) => {
	const auth = useAuth();
	const { notifications, closeNotification, markAsRead } = useNotificationStore();
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [enableNotifications] = useState(true);
	const [taskEnabled, setTaskEnabled] = useState(true);
	const [invitationEnabled, setInvitationEnabled] = useState(true);
	const [achievementEnabled, setAchievementEnabled] = useState(true);
	const [taskNotificationInterval, setTaskNotificationInterval] = useState(30);

	const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setTaskNotificationInterval(Number(e.target.value));
	};

	const handleSettingsChange = () => {
		console.log({
			enableNotifications,
			taskEnabled,
			invitationEnabled,
			achievementEnabled,
			taskNotificationInterval
		});
		setIsSettingsOpen(false);
	};

	const handleAccept = async (invitationId: string, notificationId: number) => {
		if (!auth?.user?.id) {
			console.log("Пользователь не авторизован.")
			return;
		}

		try {
			await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invitations/${invitationId}/accept?recipientId=${auth.user.id}`, {
				method: "PUT",
				credentials: "include",
			});

			handleMarkAsRead(Number(notificationId));

			handleCloseNotification(Number(notificationId));
		} catch (error) {
			console.error("Ошибка принятия приглашения:", error);
		}
	};

	const handleDecline = async (invitationId: string, notificationId: number) => {
		if (!auth?.user?.id) {
			console.log("Пользователь не авторизован.")
			return;
		}

		try {
			await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invitations/${invitationId}/decline?recipientId=${auth.user.id}`, {
				method: "PUT",
				credentials: "include",
			});

			handleMarkAsRead(Number(notificationId));

			handleCloseNotification(Number(notificationId));
		} catch (error) {
			console.error("Ошибка отклонения приглашения:", error);
		}
	};

	const handleCloseNotification = async (id: number) => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}/close`, {
				method: 'PATCH',
				credentials: 'include',
			});

			if (!response.ok) {
				throw new Error(`Ошибка закрытия уведомления: ${response.statusText}`);
			}

			closeNotification(id);
		} catch (error) {
			console.error('Не удалось закрыть уведомление: ', error);
		}
	};

	const handleCloseAllNotifications = async () => {
		try {
			const closePromises = notifications.map((notification) =>
				fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notification.id}/close`, {
					method: 'PATCH',
					credentials: 'include',
				}).then((res) => {
					if (!res.ok) throw new Error(`Ошибка закрытия уведомления ${notification.id}`);
					return notification.id;
				})
			);

			const closedIds = await Promise.all(closePromises);
			closedIds.forEach((id) => closeNotification(id));
		} catch (error) {
			console.error('Ошибка при закрытии всех уведомлений: ', error);
		}
	};

	const handleMarkAsRead = async (id: number) => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}/read`, {
				method: "PATCH",
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error(`Ошибка пометки уведомления как прочитанного: ${response.statusText}`);
			}

			markAsRead(id);
		} catch (error) {
			console.error('Не удалось пометить уведомление как прочитанное: ', error);
		}
	};

	const getNotificationMessage = (notification: Notification) => {
		switch (notification.type) {
			case Type.TASK_DEADLINE:
				return (
					<>
						Срок выполнения задачи{' '}
						<Link
							href={`/task/${notification.metadata.taskId}` || '#'}
							onClick={() => { onClose(); handleMarkAsRead(notification.id); }}
							className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
						>
							{notification.metadata.taskTitle}
						</Link>
						{' '}закончится в {notification.metadata.deadline}
					</>
				);
			case Type.TASK_INVITATION:
				return (
					<>
						<Link
							href={`/users/${notification.metadata.username}` || '#'}
							onClick={() => { onClose(); handleMarkAsRead(notification.id); }}
							className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
						>
							{notification.metadata.username}
						</Link>
						{' '}пригласил вас выполнить задачу{' '}
						<Link
							href={`/task/${notification.metadata.taskId}` || '#'}
							onClick={() => { onClose(); handleMarkAsRead(notification.id); }}
							className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
						>
							{notification.metadata.taskTitle}
						</Link>
						{' '}c правами <span>{notification.metadata.accessLevel}</span>
						<div className="mt-2 space-x-2">
							<button
								onClick={() => handleAccept(notification.metadata.invitationId!, notification.id)}
								className="px-2 py-1 bg-green-500 text-white rounded"
							>
								Принять
							</button>
							<button
								onClick={() => handleDecline(notification.metadata.invitationId!, notification.id)}
								className="px-2 py-1 bg-red-500 text-white rounded"
							>
								Отклонить
							</button>
						</div>
					</>
				);
			case Type.USER_ACHIEVEMENT:
				return (
					<>
						Вы заработали{' '}
						<Link
							href={'/achievements'}
							onClick={() => { onClose(); handleMarkAsRead(notification.id); }}
							className="font-bold text-blue-600 hover:text-blue-700 transition-colors"
						>
							{notification.metadata.achievementName}
						</Link>
					</>
				);
			case Type.TASK_INVITATION_RESPONSE:
				return (
					<>
						Пользователь{' '}
						<Link
							href={`/users/${notification.metadata.username}` || '#'}
							onClick={() => { onClose(); handleMarkAsRead(notification.id); }}
							className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
						>
							{notification.metadata.username}
						</Link>
						{' '}<strong>{notification.metadata.action}</strong> ваше приглашение на задачу{' '}
						<Link
							href={`/task/${notification.metadata.taskId}` || '#'}
							onClick={() => { onClose(); handleMarkAsRead(notification.id); }}
							className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
						>
							{notification.metadata.taskTitle}
						</Link>
					</>
				);
			case Type.TASK_ACCESS_RIGHTS_CHANGED:
				return (
					<>
						Ваши права для задачи{' '}
						<Link
							href={`/task/${notification.metadata.taskId}` || '#'}
							onClick={() => { onClose(); handleMarkAsRead(notification.id); }}
							className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
						>
							{notification.metadata.taskTitle}
						</Link>
						{' '}изменены на <strong>{notification.metadata.accessLevel}</strong>
					</>
				);
			case Type.TASK_ACCESS_RIGHTS_REMOVED:
				return (
					<>
						Ваш доступ к задаче{' '}
						<Link
							href={`/task/${notification.metadata.taskId}` || '#'}
							onClick={() => { onClose(); handleMarkAsRead(notification.id); }}
							className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
						>
							{notification.metadata.taskTitle}
						</Link>
						{' '}был удалён
					</>
				);
			default:
				return <span>Неизвестное уведомление</span>;
		}
	};

	return (
		<div className="absolute right-0 top-full mt-6 w-80 bg-white shadow-lg rounded-lg p-5 z-50 border border-gray-200">
			<div className="flex justify-between items-center mb-2">
				<h3 className="text-lg font-semibold text-gray-900 ml-1">Уведомления</h3>
				<button
					onClick={() => setIsSettingsOpen(true)}
					className="text-gray-500 hover:text-gray-700"
					aria-label="Открыть настройки уведомлений"
				>
					<Cog6ToothIcon className="w-5 h-5" />
				</button>
			</div>

			{notifications.filter((n) => !n.isClosed).length > 0 && (
				<button
					onClick={handleCloseAllNotifications}
					className="text-sm text-blue-600 hover:text-blue-800 mb-2 ml-1 transition-colors"
					aria-label="Очистить все уведомления"
				>
					Очистить все
				</button>
			)}

			{notifications.filter((n) => !n.isClosed).length === 0 ? (
				<p className="text-sm text-gray-500 ml-1 mb-1">Пока ничего нового</p>
			) : (
				<ul className="space-y-2 p-2 max-h-60 overflow-y-auto no-scrollbar">
					{notifications
						.filter((n) => !n.isClosed)
						.toSorted((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
						.map((notification) => (
							<li key={notification.id} className={`border-b border-gray-100 pb-2 relative ${notification.isRead ? "opacity-50" : ""}`}>
								<div className="text-sm font-semibold text-gray-900 mt-2">{notification.title}</div>
								<div className="text-xs text-gray-600 pt-2">
									{getNotificationMessage(notification)}
								</div>
								<p className="text-xs text-gray-400 mt-1">
									{formatDistanceToNow(new Date(notification.createdAt), {
										addSuffix: true,
										locale: ru,
									})}
								</p>
								<button
									onClick={() => handleCloseNotification(notification.id)}
									className="absolute top-0 right-0 text-gray-500 hover:text-red-600"
									aria-label="Закрыть уведомление"
								>
									<XMarkIcon className="w-4 h-4" />
								</button>
							</li>
						))}
				</ul>
			)}

			<button
				onClick={onClose}
				className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700"
				aria-label="Закрыть шторку уведомлений"
			>
				Закрыть
			</button>

			{/* Модальное окно настроек */}
			{isSettingsOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-96 max-w-[90%]">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold text-gray-900">Настройки уведомлений</h3>
							<button
								onClick={() => setIsSettingsOpen(false)}
								className="text-gray-500 hover:text-gray-700"
								aria-label="Закрыть настройки"
							>
								<XMarkIcon className="w-5 h-5" />
							</button>
						</div>
						<div className="space-y-4">
							{/* <div className="flex items-center">
								<input
									type="checkbox"
									id="enableNotifications"
									checked={enableNotifications}
									onChange={(e) => handleToggleNotifications(e.target.checked)}
									className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
								/>
								<label htmlFor="enableNotifications" className="ml-2 block text-sm font-medium text-gray-700">
									Включить браузерные уведомления
								</label>
							</div> */}
							<div className="flex items-center">
								<input
									type="checkbox"
									id="taskEnabled"
									checked={taskEnabled}
									onChange={(e) => setTaskEnabled(e.target.checked)}
									className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
								/>
								<label htmlFor="taskEnabled" className="ml-2 block text-sm font-medium text-gray-700">
									Включить уведомления о задачах
								</label>
							</div>
							<div className="flex items-center">
								<input
									type="checkbox"
									id="invitationEnabled"
									checked={invitationEnabled}
									onChange={(e) => setInvitationEnabled(e.target.checked)}
									className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
								/>
								<label htmlFor="invitationEnabled" className="ml-2 block text-sm font-medium text-gray-700">
									Включить уведомления о приглашениях
								</label>
							</div>
							<div className="flex items-center">
								<input
									type="checkbox"
									id="achievementEnabled"
									checked={achievementEnabled}
									onChange={(e) => setAchievementEnabled(e.target.checked)}
									className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
								/>
								<label htmlFor="achievementEnabled" className="ml-2 block text-sm font-medium text-gray-600">
									Включить уведомления о достижениях
								</label>
							</div>
							{taskEnabled && (
								<>
									<label htmlFor="taskNotificationInterval" className="block text-sm font-medium text-gray-600">
										Частота напоминаний
									</label>
									<select
										id="taskNotificationInterval"
										value={taskNotificationInterval}
										onChange={handleIntervalChange}
										className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									>
										<option value={5}>5 минут</option>
										<option value={15}>15 минут</option>
										<option value={30}>30 минут</option>
										<option value={60}>1 час</option>
										<option value={120}>2 часа</option>
									</select>
								</>
							)}
							<p className="text-sm text-gray-400">
								{enableNotifications
									? "Уведомления о задачах с наступающим сроком будут приходить за указанное время."
									: "Браузерные уведомления отключены."}
							</p>
							<div className="flex justify-end gap-2">
								<button
									onClick={() => setIsSettingsOpen(false)}
									className="px-4 py-2 text-gray-200 rounded hover:bg-gray-300"
								>
									Отмена
								</button>
								<button
									onClick={handleSettingsChange}
									className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
								>
									Сохранить
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default NotificationsDropdown;
