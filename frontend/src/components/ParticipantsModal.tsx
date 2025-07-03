'use client';

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { TaskAccess } from './ManageAccessModal';

interface ParticipantsModalProps {
	isOpen: boolean;
	onClose: () => void;
	participants: TaskAccess[];
}

export default function ParticipantsModal({ isOpen, onClose, participants }: ParticipantsModalProps) {
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
							<DialogPanel className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl">
								<DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
									Участники
								</DialogTitle>
								<button
									onClick={onClose}
									className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
								>
									<XMarkIcon className="w-6 h-6" />
								</button>

								<div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
									<AnimatePresence>
										{participants.map((participant) => (
											<motion.div
												key={participant.id}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: 10 }}
												className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
											>
												<Link
													href={`/users/${participant.username}`}
													className="flex items-center flex-1"
												>
													{participant.avatar ? (
														<Image
															src={participant.avatar}
															alt={participant.username}
															width={32}
															height={32}
															className="rounded-full"
														/>
													) : (
														<UserCircleIcon className="w-8 h-8 text-gray-400" />
													)}
													<div className="ml-3">
														<p className="text-sm font-medium text-gray-900 dark:text-white">
															{participant.username}
														</p>
													</div>
												</Link>
											</motion.div>
										))}
									</AnimatePresence>
								</div>
							</DialogPanel>
						</TransitionChild>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
}
