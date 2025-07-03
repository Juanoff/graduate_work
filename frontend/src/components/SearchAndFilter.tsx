'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { AccessLevel, Category, Priority, StatusType } from '@/types/task';
import { FilterOptions, useTaskStore } from '@/stores/taskStore';
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';

interface SearchAndFilterProps {
	categories: Category[];
}

interface User {
	id: number;
	username: string;
}

export default function SearchAndFilter({ categories }: SearchAndFilterProps) {
	const { setFilteredTasks } = useTaskStore();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [filters, setFilters] = useState<FilterOptions>({
		query: searchParams.get('query') || '',
		status: (searchParams.get('status') as StatusType) || '',
		priority: (searchParams.get('priority') as Priority) || '',
		categoryId: searchParams.get('categoryId') || '',
		dueDateFilter: searchParams.get('dueDateFilter') || '',
		accessLevel: (searchParams.get('accessLevel') as AccessLevel) || '',
		myTasks: searchParams.get('myTasks') === 'true',
		sharedByUsername: searchParams.get('sharedByUsername') || '',
	});
	const [users, setUsers] = useState<User[]>([]);

	// Загрузка пользователей
	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/users`, {
					credentials: 'include',
				});

				if (!res.ok) throw new Error('Ошибка загрузки пользователей');

				const data = await res.json();
				setUsers(data);
			} catch (err) {
				console.error(err);
			}
		};

		fetchUsers();
	}, []);

	useEffect(() => {
		setFilteredTasks(filters);
		const params = new URLSearchParams();
		if (filters.query) params.set('query', filters.query);
		if (filters.status) params.set('status', filters.status);
		if (filters.priority) params.set('priority', filters.priority);
		if (filters.categoryId) params.set('categoryId', filters.categoryId);
		if (filters.dueDateFilter) params.set('dueDateFilter', filters.dueDateFilter);
		if (filters.accessLevel) params.set('accessLevel', filters.accessLevel);
		if (filters.myTasks) params.set('myTasks', 'true');
		if (filters.sharedByUsername) params.set('sharedByUsername', filters.sharedByUsername);
		router.replace(`/?${params.toString()}`, { scroll: false });
	}, [filters, router, setFilteredTasks]);

	const handleFilterChange = useCallback((key: string, value: string | boolean) => {
		setFilters((prev) => ({
			...prev,
			[key]: value,
		}));
	}, []);

	const removeFilter = useCallback((key: string) => {
		setFilters((prev) => ({
			...prev,
			[key]: key === 'myTasks' ? false : '',
		}));
	}, []);

	const resetFilters = useCallback(() => {
		setFilters({
			query: '',
			status: '',
			priority: '',
			categoryId: '',
			dueDateFilter: '',
			accessLevel: '',
			myTasks: false,
			sharedByUsername: '',
		});
	}, []);

	const activeFilters = Object.entries(filters).filter(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		([key, value]) => value && (typeof value === 'string' ? value !== '' : true)
	);

	return (
		<motion.div
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			className="mb-6 mr-4 max-w-[1200px] mx-auto"
		>
			{/* Панель поиска */}
			<div className="relative">
				<MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
				<input
					type="text"
					value={filters.query}
					onChange={(e) => handleFilterChange('query', e.target.value)}
					placeholder="Поиск задач..."
					className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
				/>
			</div>

			{/* Быстрые фильтры и кнопка фильтров */}
			<div className="flex items-center gap-2 mt-3">
				<button
					onClick={() => handleFilterChange('myTasks', !filters.myTasks)}
					className={clsx(
						'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
						filters.myTasks
							? 'bg-blue-600 text-white'
							: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
					)}
				>
					Мои задачи
				</button>
				<button
					onClick={() => handleFilterChange('dueDateFilter', 'overdue')}
					className={clsx(
						'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
						filters.dueDateFilter === 'overdue'
							? 'bg-red-600 text-white'
							: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
					)}
				>
					Просроченные
				</button>
				<button
					onClick={() => handleFilterChange('dueDateFilter', 'noDate')}
					className={clsx(
						'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
						filters.dueDateFilter === 'noDate'
							? 'bg-gray-600 text-white'
							: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
					)}
				>
					Без даты
				</button>
				<button
					onClick={() => setIsFilterOpen(!isFilterOpen)}
					className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
				>
					<FunnelIcon className="w-4 h-4" />
					Фильтры
				</button>
			</div>

			{/* Панель фильтров */}
			<AnimatePresence>
				{isFilterOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						className="mt-3 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
					>
						<div className="grid grid-cols-2 gap-4">
							{/* Статус */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									Статус
								</label>
								<select
									value={filters.status}
									onChange={(e) => handleFilterChange('status', e.target.value)}
									className="mt-1 w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
								>
									<option value="">Все</option>
									{Object.values(StatusType).map((status) => (
										<option key={status} value={status}>
											{status === StatusType.TO_DO ? 'В ожидании' : status === StatusType.IN_PROGRESS ? 'В процессе' : 'Завершено'}
										</option>
									))}
								</select>
							</div>

							{/* Приоритет */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									Приоритет
								</label>
								<select
									value={filters.priority}
									onChange={(e) => handleFilterChange('priority', e.target.value)}
									className="mt-1 w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
								>
									<option value="">Все</option>
									{Object.values(Priority).map((priority) => (
										<option key={priority} value={priority}>
											{priority === Priority.LOW ? 'Низкий' : priority === Priority.MEDIUM ? 'Средний' : 'Высокий'}
										</option>
									))}
								</select>
							</div>

							{/* Категория */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									Категория
								</label>
								<select
									value={filters.categoryId}
									onChange={(e) => handleFilterChange('categoryId', e.target.value)}
									className="mt-1 w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
								>
									<option value="">Все</option>
									{categories.map((category) => (
										<option key={category.id} value={category.id}>
											{category.name}
										</option>
									))}
								</select>
							</div>

							{/* Срок выполнения */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									Срок
								</label>
								<select
									value={filters.dueDateFilter}
									onChange={(e) => handleFilterChange('dueDateFilter', e.target.value)}
									className="mt-1 w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
								>
									<option value="">Все</option>
									<option value="today">Сегодня</option>
									<option value="week">На этой неделе</option>
									<option value="overdue">Просроченные</option>
									<option value="noDate">Без даты</option>
								</select>
							</div>

							{/* Доступ */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									Моя роль
								</label>
								<select
									value={filters.accessLevel}
									onChange={(e) => handleFilterChange('accessLevel', e.target.value)}
									className="mt-1 w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
								>
									<option value="">Все</option>
									{Object.values(AccessLevel).map((level) => (
										<option key={level} value={level}>
											{level === AccessLevel.VIEW ? 'Просмотр' : level === AccessLevel.EDIT ? 'Редактирование' : 'Владелец'}
										</option>
									))}
								</select>
							</div>

							{/* Фильтр по пользователю */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									Поделился
								</label>
								<Combobox
									value={filters.sharedByUsername}
									onChange={(value) => value != null && handleFilterChange('sharedByUsername', value)}
								>
									<div className="relative mt-1">
										<ComboboxInput
											className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
											placeholder="Выберите пользователя"
											displayValue={(username: string) => username}
										/>
										<ComboboxOptions className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg max-h-60 overflow-auto">
											{users.map((user) => (
												<ComboboxOption
													key={user.id}
													value={user.username}
													className={({ active }) =>
														clsx(
															'p-2 cursor-pointer',
															active ? 'bg-blue-100 dark:bg-blue-900' : ''
														)
													}
												>
													{user.username}
												</ComboboxOption>
											))}
										</ComboboxOptions>
									</div>
								</Combobox>
							</div>
						</div>
					</motion.div>
				)
				}
			</AnimatePresence >

			{/* Активные фильтры (чипсы) */}
			<AnimatePresence>
				{
					activeFilters.length > 0 && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className="flex flex-wrap gap-2 mt-3"
						>
							{activeFilters.map(([key, value]) => (
								<motion.div
									key={key}
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									exit={{ scale: 0 }}
									className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
								>
									<span>
										{key === 'status' && (value === StatusType.TO_DO ? 'К выполнению' : value === StatusType.IN_PROGRESS ? 'В процессе' : 'Выполнено')}
										{key === 'priority' && (value === Priority.LOW ? 'Низкий' : value === Priority.MEDIUM ? 'Средний' : 'Высокий')}
										{key === 'categoryId' && categories.find((c) => c.id === Number(value))?.name}
										{key === 'dueDateFilter' && (value === 'today' ? 'Сегодня' : value === 'week' ? 'На неделе' : value === 'overdue' ? 'Просроченные' : 'Без даты')}
										{key === 'accessLevel' && (value === AccessLevel.VIEW ? 'Просмотр' : value === AccessLevel.EDIT ? 'Редактирование' : 'Владелец')}
										{key === 'myTasks' && 'Мои задачи'}
										{key === 'query' && `Поиск: ${value}`}
										{key === 'sharedByUsername' && `От: ${value}`}
									</span>
									<button
										onClick={() => removeFilter(key)}
										className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
									>
										<XMarkIcon className="w-4 h-4" />
									</button>
								</motion.div>
							))}
							<button
								onClick={resetFilters}
								className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
							>
								Сбросить
							</button>
						</motion.div>
					)
				}
			</AnimatePresence >
		</motion.div >
	);
}
