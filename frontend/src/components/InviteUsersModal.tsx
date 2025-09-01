// 'use client';

// import { useState, useEffect, useCallback, useMemo } from 'react';
// import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
// import { Fragment } from 'react';
// import { XMarkIcon, PlusIcon, UserIcon } from '@heroicons/react/24/outline';
// import { motion, AnimatePresence } from 'framer-motion';
// import debounce from 'lodash.debounce';
// import Image from 'next/image';
// import Link from 'next/link';

// interface User {
// 	id: number;
// 	username: string;
// 	avatar?: string;
// 	fullName?: string;
// }

// interface InviteUsersModalProps {
// 	isOpen: boolean;
// 	onClose: () => void;
// 	onInvite: (userIds: number[]) => Promise<void>;
// 	// taskId: number;
// }

// //, taskId
// export default function InviteUsersModal({ isOpen, onClose, onInvite }: InviteUsersModalProps) {
// 	const [searchQuery, setSearchQuery] = useState('');
// 	const [users, setUsers] = useState<User[]>([]);
// 	const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
// 	const [isLoading, setIsLoading] = useState(false);
// 	const [error, setError] = useState<string | null>(null);
// 	const [selectedProfile, setSelectedProfile] = useState<User | null>(null);

// 	// Debounced поиск
// 	const searchUsers = useCallback(
// 		debounce(async (query: string) => {
// 			if (query.length < 2) {
// 				setUsers([]);
// 				return;
// 			}

// 			setIsLoading(true);
// 			setError(null);

// 			try {
// 				const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users?search=${encodeURIComponent(query)}`, {
// 					credentials: 'include',
// 				});
// 				if (!res.ok) throw new Error('Ошибка при поиске пользователей');
// 				const data = await res.json();
// 				setUsers(data);
// 			} catch (err) {
// 				setError('Не удалось загрузить пользователей');
// 				console.error(err);
// 			} finally {
// 				setIsLoading(false);
// 			}
// 		}, 400),
// 		[]
// 	);

// 	useEffect(() => {
// 		searchUsers(searchQuery);
// 		return () => searchUsers.cancel(); // Очистка debounce
// 	}, [searchQuery, searchUsers]);

// 	// Мемоизация отфильтрованных пользователей
// 	const filteredUsers = useMemo(() => {
// 		return users.filter((user) => !selectedUsers.some((selected) => selected.id === user.id));
// 	}, [users, selectedUsers]);

// 	// Добавление/удаление пользователей
// 	const handleAddUser = useCallback((user: User) => {
// 		setSelectedUsers((prev) => [...prev, user]);
// 	}, []);

// 	const handleRemoveUser = useCallback((userId: number) => {
// 		setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));
// 	}, []);

// 	// Отправка приглашений
// 	const handleInviteUsers = useCallback(async () => {
// 		try {
// 			await onInvite(selectedUsers.map((user) => user.id));
// 			onClose();
// 		} catch (err) {
// 			setError('Ошибка при отправке приглашений');
// 			console.error(err);
// 		}
// 	}, [selectedUsers, onInvite, onClose]);

// 	return (
// 		<Transition appear show={isOpen} as={Fragment}>
// 			<Dialog as="div" className="relative z-10" onClose={onClose}>
// 				<TransitionChild
// 					as={Fragment}
// 					enter="ease-out duration-300"
// 					enterFrom="opacity-0"
// 					enterTo="opacity-100"
// 					leave="ease-in duration-200"
// 					leaveFrom="opacity-100"
// 					leaveTo="opacity-0"
// 				>
// 					<div className="fixed inset-0 bg-black/30" />
// 				</TransitionChild>

// 				<div className="fixed inset-0 overflow-y-auto">
// 					<div className="flex min-h-full items-center justify-center p-4">
// 						<TransitionChild
// 							as={Fragment}
// 							enter="ease-out duration-300"
// 							enterFrom="opacity-0 scale-95"
// 							enterTo="opacity-100 scale-100"
// 							leave="ease-in duration-200"
// 							leaveFrom="opacity-100 scale-100"
// 							leaveTo="opacity-0 scale-95"
// 						>
// 							<DialogPanel className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all relative">
// 								{/* Основная модалка */}
// 								{!selectedProfile ? (
// 									<>
// 										<DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
// 											Пригласить пользователей
// 										</DialogTitle>
// 										<button
// 											onClick={onClose}
// 											className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
// 										>
// 											<XMarkIcon className="w-6 h-6" />
// 										</button>

// 										<div className="mt-4 space-y-4">
// 											{/* Поле поиска */}
// 											<div className="relative">
// 												<input
// 													type="text"
// 													value={searchQuery}
// 													onChange={(e) => setSearchQuery(e.target.value)}
// 													placeholder="Поиск по имени пользователя..."
// 													className="w-full p-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
// 												/>
// 												{isLoading && (
// 													<div className="absolute right-3 top-1/2 -translate-y-1/2">
// 														<svg
// 															className="animate-spin h-5 w-5 text-blue-500"
// 															xmlns="http://www.w3.org/2000/svg"
// 															fill="none"
// 															viewBox="0 0 24 24"
// 														>
// 															<circle
// 																className="opacity-25"
// 																cx="12"
// 																cy="12"
// 																r="10"
// 																stroke="currentColor"
// 																strokeWidth="4"
// 															/>
// 															<path
// 																className="opacity-75"
// 																fill="currentColor"
// 																d="M4 12a8 8 0 018-8v8z"
// 															/>
// 														</svg>
// 													</div>
// 												)}
// 											</div>

// 											{/* Ошибка */}
// 											{error && (
// 												<p className="text-red-500 text-sm">{error}</p>
// 											)}

// 											{/* Выбранные пользователи */}
// 											<AnimatePresence>
// 												{selectedUsers.length > 0 && (
// 													<motion.div
// 														initial={{ opacity: 0, height: 0 }}
// 														animate={{ opacity: 1, height: 'auto' }}
// 														exit={{ opacity: 0, height: 0 }}
// 														className="flex flex-wrap gap-2"
// 													>
// 														{selectedUsers.map((user) => (
// 															<motion.div
// 																key={user.id}
// 																initial={{ scale: 0 }}
// 																animate={{ scale: 1 }}
// 																exit={{ scale: 0 }}
// 																className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
// 															>
// 																<span>{user.username}</span>
// 																<button
// 																	onClick={() => handleRemoveUser(user.id)}
// 																	className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
// 																>
// 																	<XMarkIcon className="w-4 h-4" />
// 																</button>
// 															</motion.div>
// 														))}
// 													</motion.div>
// 												)}
// 											</AnimatePresence>

// 											{/* Список пользователей */}
// 											<div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
// 												<AnimatePresence>
// 													{filteredUsers.map((user) => (
// 														<motion.div
// 															key={user.id}
// 															initial={{ opacity: 0, y: -10 }}
// 															animate={{ opacity: 1, y: 0 }}
// 															exit={{ opacity: 0, y: -10 }}
// 															className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
// 														>
// 															<div
// 																className="flex items-center flex-1"
// 																onClick={() => setSelectedProfile(user)}
// 															>
// 																{user.avatar ? (
// 																	<Image
// 																		src={user.avatar}
// 																		alt={user.username}
// 																		width={40}
// 																		height={40}
// 																		className="rounded-full mr-3"
// 																	/>
// 																) : (
// 																	<UserIcon className="w-10 h-10 text-gray-400 mr-3" />
// 																)}
// 																<div>
// 																	<p className="font-medium text-gray-900 dark:text-white">
// 																		{user.fullName || user.username}
// 																	</p>
// 																	<p className="text-sm text-gray-500 dark:text-gray-400">
// 																		@{user.username}
// 																	</p>
// 																</div>
// 															</div>
// 															<button
// 																onClick={() => handleAddUser(user)}
// 																className="ml-auto text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
// 															>
// 																<PlusIcon className="w-6 h-6" />
// 															</button>
// 														</motion.div>
// 													))}
// 												</AnimatePresence>
// 												{filteredUsers.length === 0 && !isLoading && searchQuery && (
// 													<p className="p-3 text-gray-500 dark:text-gray-400 text-center">
// 														Пользователи не найдены
// 													</p>
// 												)}
// 											</div>

// 											{/* Кнопка приглашения */}
// 											<button
// 												onClick={handleInviteUsers}
// 												disabled={selectedUsers.length === 0}
// 												className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 transition-colors"
// 											>
// 												Пригласить {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}
// 											</button>
// 										</div>
// 									</>
// 								) : (
// 									/* Просмотр профиля */
// 									<motion.div
// 										initial={{ x: '100%' }}
// 										animate={{ x: 0 }}
// 										exit={{ x: '100%' }}
// 										className="p-6"
// 									>
// 										<button
// 											onClick={() => setSelectedProfile(null)}
// 											className="flex items-center text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
// 										>
// 											<svg
// 												className="w-5 h-5 mr-2"
// 												fill="none"
// 												stroke="currentColor"
// 												viewBox="0 0 24 24"
// 											>
// 												<path
// 													strokeLinecap="round"
// 													strokeLinejoin="round"
// 													strokeWidth="2"
// 													d="M15 19l-7-7 7-7"
// 												/>
// 											</svg>
// 											Назад
// 										</button>
// 										<div className="flex items-center mb-4">
// 											{selectedProfile.avatar ? (
// 												<Image
// 													src={selectedProfile.avatar}
// 													alt={selectedProfile.username}
// 													width={64}
// 													height={64}
// 													className="rounded-full mr-4"
// 												/>
// 											) : (
// 												<UserIcon className="w-16 h-16 text-gray-400 mr-4" />
// 											)}
// 											<div>
// 												<h3 className="text-xl font-semibold text-gray-900 dark:text-white">
// 													{selectedProfile.fullName || selectedProfile.username}
// 												</h3>
// 												<p className="text-gray-500 dark:text-gray-400">
// 													@{selectedProfile.username}
// 												</p>
// 											</div>
// 										</div>
// 										<Link
// 											href={`/profile/${selectedProfile.id}`}
// 											className="block text-blue-500 hover:underline dark:text-blue-400"
// 										>
// 											Перейти в профиль
// 										</Link>
// 									</motion.div>
// 								)}
// 							</DialogPanel>
// 						</TransitionChild>
// 					</div>
// 				</div>
// 			</Dialog>
// 		</Transition>
// 	);
// }

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, PlusIcon, UserIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import debounce from 'lodash.debounce';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/useAuth';
import { AccessLevel } from '@/types/task';

interface User {
	id: number;
	username: string;
	avatar?: string;
	fullName?: string;
}

interface InviteUsersModalProps {
	isOpen: boolean;
	onClose: () => void;
	taskId: number;
}

export default function InviteUsersModal({ isOpen, onClose, taskId }: InviteUsersModalProps) {
	const { user: authUser } = useAuth();
	const [searchQuery, setSearchQuery] = useState('');
	const [users, setUsers] = useState<User[]>([]);
	const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
	const [accessLevel, setAccessLevel] = useState<AccessLevel | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedProfile, setSelectedProfile] = useState<User | null>(null);

	// Мемоизированный debounced поиск
	const searchUsers = useMemo(
		() =>
			debounce(async (query: string) => {
				if (query.length < 2) {
					setUsers([]);
					return;
				}

				setIsLoading(true);
				setError(null);

				try {
					const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users?search=${encodeURIComponent(query)}&taskId=${taskId}`, {
						credentials: 'include',
					});

					if (!res.ok) throw new Error('Ошибка при поиске пользователей');

					const data = await res.json();
					setUsers(data);
				} catch (err) {
					setError('Не удалось загрузить пользователей');
					console.error(err);
				} finally {
					setIsLoading(false);
				}
			}, 400),
		[taskId]
	);

	useEffect(() => {
		searchUsers(searchQuery);
		return () => searchUsers.cancel();
	}, [searchQuery, searchUsers]);

	// Мемоизация отфильтрованных пользователей
	const filteredUsers = useMemo(() => {
		return users.filter((user) => !selectedUsers.some((selected) => selected.id === user.id));
	}, [users, selectedUsers]);

	// Добавление/удаление пользователей
	const handleAddUser = useCallback((user: User) => {
		setSelectedUsers((prev) => [...prev, user]);
	}, []);

	const handleRemoveUser = useCallback((userId: number) => {
		setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));
	}, []);

	// Отправка приглашений
	const handleShare = useCallback(async () => {
		if (!authUser || !taskId || !accessLevel) return;

		const invitations = selectedUsers.map((user) => ({
			taskId,
			senderId: authUser.id,
			recipientId: user.id,
			accessLevel,
		}));

		try {
			await Promise.all(
				invitations.map((invitation) =>
					fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invitations`, {
						method: 'POST',
						credentials: 'include',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(invitation),
					}).then((res) => {
						if (!res.ok) throw new Error('Ошибка при отправке приглашения');
						return res.json();
					})
				)
			);
			onClose();
			setSelectedUsers([]);
			setAccessLevel(null);
		} catch (err) {
			setError('Ошибка при отправке приглашений');
			console.error(err);
		}
	}, [authUser, taskId, selectedUsers, accessLevel, onClose]);

	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-10" onClose={onClose}>
				<TransitionChild
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black/30" />
				</TransitionChild>

				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4">
						<TransitionChild
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<DialogPanel className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all relative">
								{/* Основная модалка */}
								{!selectedProfile ? (
									<>
										<DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
											Пригласить пользователей
										</DialogTitle>
										<button
											onClick={onClose}
											className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
										>
											<XMarkIcon className="w-6 h-6" />
										</button>

										<div className="mt-4 space-y-4">
											{/* Поле поиска */}
											<div className="relative">
												<input
													type="text"
													value={searchQuery}
													onChange={(e) => setSearchQuery(e.target.value)}
													placeholder="Введите имя пользователя..."
													className="w-full p-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
												/>
												{isLoading && (
													<div className="absolute right-3 top-1/2 -translate-y-1/2">
														<svg
															className="animate-spin h-5 w-5 text-blue-500"
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 24 24"
														>
															<circle
																className="opacity-25"
																cx="12"
																cy="12"
																r="10"
																stroke="currentColor"
																strokeWidth="4"
															/>
															<path
																className="opacity-75"
																fill="currentColor"
																d="M4 12a8 8 0 018-8v8z"
															/>
														</svg>
													</div>
												)}
											</div>

											{/* Ошибка */}
											{error && <p className="text-red-500 text-sm">{error}</p>}

											{/* Выбранные пользователи */}
											<AnimatePresence>
												{selectedUsers.length > 0 && (
													<motion.div
														initial={{ opacity: 0, height: 0 }}
														animate={{ opacity: 1, height: 'auto' }}
														exit={{ opacity: 0, height: 0 }}
														className="flex flex-wrap gap-2"
													>
														{selectedUsers.map((user) => (
															<motion.div
																key={user.id}
																initial={{ scale: 0 }}
																animate={{ scale: 1 }}
																exit={{ scale: 0 }}
																className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
															>
																<span>{user.username}</span>
																<button
																	onClick={() => handleRemoveUser(user.id)}
																	className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
																>
																	<XMarkIcon className="w-4 h-4" />
																</button>
															</motion.div>
														))}
													</motion.div>
												)}
											</AnimatePresence>

											{/* Список пользователей */}
											{searchQuery && (<div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
												<AnimatePresence>
													{filteredUsers.map((user) => (
														<motion.div
															key={user.id}
															initial={{ opacity: 0, y: -10 }}
															animate={{ opacity: 1, y: 0 }}
															exit={{ opacity: 0, y: -10 }}
															className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
														>
															<div
																className="flex items-center flex-1"
																onClick={() => setSelectedProfile(user)}
															>
																{user.avatar ? (
																	<Image
																		src={user.avatar}
																		alt={user.username}
																		width={40}
																		height={40}
																		className="rounded-full mr-3"
																	/>
																) : (
																	<UserIcon className="w-8 h-8 text-gray-400 mr-3" />
																)}
																<div>
																	<p className="font-medium text-gray-900 dark:text-white">
																		{user.fullName || user.username}
																	</p>
																	<p className="text-sm text-gray-500 dark:text-gray-400">
																		@{user.username}
																	</p>
																</div>
															</div>
															<button
																onClick={() => handleAddUser(user)}
																className="ml-auto text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
															>
																<PlusIcon className="w-6 h-6" />
															</button>
														</motion.div>
													))}
												</AnimatePresence>
												{filteredUsers.length === 0 && !isLoading && searchQuery && (
													<p className="p-3 text-gray-500 dark:text-gray-400 text-center">
														Пользователи не найдены
													</p>
												)}
											</div>)}

											<AnimatePresence>
												{selectedUsers.length > 0 && (
													<motion.div
														initial={{ opacity: 0, y: -10 }}
														animate={{ opacity: 1, y: 0 }}
														exit={{ opacity: 0, y: -10 }}
														transition={{ duration: 0.2 }}
														className="relative"
													>
														<label
															htmlFor="accessLevel"
															className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
														>
															Права доступа
														</label>
														<select
															id="accessLevel"
															value={accessLevel || ''}
															onChange={(e) => setAccessLevel(e.target.value as AccessLevel)}
															className="w-full appearance-none p-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
														>
															<option value="" disabled>
																Выберите права
															</option>
															{Object.values(AccessLevel).filter(a => a != AccessLevel.OWNER).map((level) => (
																<option key={level} value={level}>
																	{level === AccessLevel.VIEW && 'Просмотр'}
																	{level === AccessLevel.EDIT && 'Редактирование'}
																</option>
															))}
														</select>
														<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pt-7 pr-3 text-gray-500">
															<svg
																className="h-4 w-4"
																xmlns="http://www.w3.org/2000/svg"
																fill="none"
																viewBox="0 0 24 24"
																stroke="currentColor"
															>
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
															</svg>
														</div>
													</motion.div>
												)}
											</AnimatePresence>

											{/* Права доступа
											<div className="relative">
												<label
													htmlFor="accessLevel"
													className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
												>
													Права доступа
												</label>
												<select
													id="accessLevel"
													value={accessLevel || ''}
													onChange={(e) => setAccessLevel(e.target.value as AccessLevel)}
													className="w-full appearance-none p-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
												>
													<option value="" disabled>
														Выберите права
													</option>
													{Object.values(AccessLevel).filter(a => a != AccessLevel.OWNER).map((level) => (
														<option key={level} value={level}>
															{level === AccessLevel.VIEW && 'Просмотр'}
															{level === AccessLevel.EDIT && 'Редактирование'}
														</option>
													))}
												</select>
												<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pt-6 pr-3 text-gray-500">
													<svg
														className="h-4 w-4"
														xmlns="http://www.w3.org/2000/svg"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
													</svg>
												</div>
											</div> */}

											<button
												onClick={handleShare}
												disabled={selectedUsers.length === 0 || !accessLevel}
												className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 transition-colors"
											>
												Пригласить {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}
											</button>
										</div>
									</>
								) : (
									<motion.div
										initial={{ x: '100%' }}
										animate={{ x: 0 }}
										exit={{ x: '100%' }}
										className="p-6"
									>
										<button
											onClick={() => setSelectedProfile(null)}
											className="flex items-center text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
										>
											<svg
												className="w-5 h-5 mr-2"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M15 19l-7-7 7-7"
												/>
											</svg>
											Назад
										</button>
										<div className="flex items-center mb-4">
											{selectedProfile.avatar ? (
												<Image
													src={selectedProfile.avatar}
													alt={selectedProfile.username}
													width={64}
													height={64}
													className="rounded-full mr-4"
												/>
											) : (
												<UserIcon className="w-10 h-10 text-gray-400 mr-4" />
											)}
											<div>
												<h3 className="text-xl font-semibold text-gray-900 dark:text-white">
													{selectedProfile.fullName || selectedProfile.username}
												</h3>
												<p className="text-gray-500 dark:text-gray-400">
													@{selectedProfile.username}
												</p>
											</div>
										</div>
										<Link
											href={`/users/${selectedProfile.username}`}
											className="block text-blue-500 hover:underline dark:text-blue-400"
										>
											Перейти в профиль
										</Link>
									</motion.div>
								)}
							</DialogPanel>
						</TransitionChild>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
}
