'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { AccessLevel } from '@/types/task';
// import { useAuth } from '../../../lib/useAuth';

export interface TaskAccess {
	id: number;
	userId: number;
	username: string;
	avatar?: string;
	accessLevel: AccessLevel;
}

interface ManageAccessModalProps {
	isOpen: boolean;
	onClose: () => void;
	taskId: number;
}

export default function ManageAccessModal({ isOpen, onClose, taskId }: ManageAccessModalProps) {
	const [accessList, setAccessList] = useState<TaskAccess[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

	useEffect(() => {
		if (!isOpen) return;

		const fetchAccessList = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}/access`, {
					credentials: 'include',
				});

				if (!res.ok) throw new Error('Ошибка загрузки доступов');

				const data = await res.json();
				setAccessList(data);
			} catch (err) {
				setError('Не удалось загрузить список доступов');
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchAccessList();
	}, [isOpen, taskId]);

	const updateAccessLevel = useCallback(
		async (accessId: number, newAccessLevel: AccessLevel) => {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/task-access/${accessId}`, {
					method: 'PATCH',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ accessLevel: newAccessLevel }),
				});

				if (!res.ok) throw new Error('Ошибка обновления прав');

				const updated = await res.json();
				setAccessList((prev) =>
					prev.map((access) =>
						access.id === accessId ? { ...access, accessLevel: updated.accessLevel } : access
					)
				);
			} catch (err) {
				setError('Не удалось обновить права');
				console.error(err);
			}
		},
		[]
	);

	const deleteAccess = useCallback(async (accessId: number) => {
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/task-access/${accessId}`, {
				method: 'DELETE',
				credentials: 'include',
			});

			if (!res.ok) throw new Error('Ошибка удаления доступа');

			setAccessList((prev) => prev.filter((access) => access.id !== accessId));
			setConfirmDelete(null);
		} catch (err) {
			setError('Не удалось удалить доступ');
			console.error(err);
		}
	}, []);

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
							<DialogPanel className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
								<DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
									Управление доступом
								</DialogTitle>
								<button
									onClick={onClose}
									className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
								>
									<XMarkIcon className="w-6 h-6" />
								</button>

								<div className="mt-4 space-y-4">
									{error && <p className="text-red-500 text-sm">{error}</p>}
									{isLoading ? (
										<div className="space-y-3">
											{[...Array(3)].map((_, i) => (
												<div
													key={i}
													className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
												/>
											))}
										</div>
									) : accessList.length === 0 ? (
										<p className="text-gray-500 dark:text-gray-400 text-center">
											Нет пользователей с доступом
										</p>
									) : (
										<div className="max-h-64 overflow-y-auto space-y-3">
											<AnimatePresence>
												{accessList.map((access) => (
													<motion.div
														key={access.id}
														initial={{ opacity: 0, y: -10 }}
														animate={{ opacity: 1, y: 0 }}
														exit={{ opacity: 0, y: -10 }}
														className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
													>
														<div className="flex items-center flex-1">
															{access.avatar ? (
																<Image
																	src={access.avatar}
																	alt={access.username}
																	width={40}
																	height={40}
																	className="rounded-full mr-3"
																/>
															) : (
																<UserIcon className="w-8 h-8 text-gray-400 mr-3" />
															)}
															<div>
																<p className="font-medium text-gray-900 dark:text-white">
																	{access.username}
																</p>
																<p className="text-sm text-gray-500 dark:text-gray-400">
																	@{access.username}
																</p>
															</div>
														</div>
														<div className="flex items-center gap-3">
															<div className="relative flex items-center">
																<select
																	value={access.accessLevel}
																	onChange={(e) =>
																		updateAccessLevel(access.id, e.target.value as AccessLevel)
																	}
																	disabled={access.accessLevel === AccessLevel.OWNER}
																	className="appearance-none p-2 pl-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
																>
																	{Object.values(AccessLevel).filter(a => a != AccessLevel.OWNER).map((level) => (
																		<option key={level} value={level}>
																			{level === AccessLevel.VIEW && 'Просмотр'}
																			{level === AccessLevel.EDIT && 'Редактирование'}
																		</option>
																	))}
																</select>
																<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500">
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
															</div>
															<button
																onClick={() => setConfirmDelete(access.id)}
																className="text-gray-500 hover:text-red-500 dark:hover:text-red-300"
															>
																<TrashIcon className="w-5 h-5" />
															</button>
														</div>
													</motion.div>
												))}
											</AnimatePresence>
										</div>
									)}
								</div>

								{/* Подтверждение удаления */}
								<Transition appear show={confirmDelete !== null} as={Fragment}>
									<Dialog
										as="div"
										className="relative z-20"
										onClose={() => setConfirmDelete(null)}
									>
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
													<DialogPanel className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl">
														<DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
															Подтверждение удаления
														</DialogTitle>
														<p className="mt-2 text-gray-600 dark:text-gray-300">
															Вы уверены, что хотите удалить доступ для этого пользователя?
														</p>
														<div className="mt-4 flex justify-end gap-2">
															<button
																onClick={() => setConfirmDelete(null)}
																className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
															>
																Отмена
															</button>
															<button
																onClick={() => deleteAccess(confirmDelete!)}
																className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
															>
																Удалить
															</button>
														</div>
													</DialogPanel>
												</TransitionChild>
											</div>
										</div>
									</Dialog>
								</Transition>
							</DialogPanel>
						</TransitionChild>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
}
