import { AccessLevel, Category, Priority, StatusType, Task } from '@/types/task';
import { addDays, parseISO, startOfDay } from 'date-fns';
import { create } from 'zustand';

export interface FilterOptions {
	query: string;
	status: StatusType | '';
	priority: Priority | '';
	categoryId: string;
	dueDateFilter: string;
	accessLevel: AccessLevel | '';
	myTasks: boolean;
	sharedByUsername: string;
}

interface TaskState {
	tasks: Task[];
	categories: Category[];
	activeTaskIds: number[];
	filteredTasks: Task[];
	setTasks: (tasks: Task[]) => void;
	updateTask: (updatedTask: Task) => void;
	addTask: (task: Task) => void;
	deleteTask: (taskId: number) => void;
	updateTaskAccessLevel: (taskId: number, accessLevel: AccessLevel) => void;
	setCategories: (categories: Category[]) => void;
	updateCategories: (updatedCategories: Category[]) => void;
	deleteCategory: (categoryId: number) => void;
	setActiveTaskIds: (taskIds: number[]) => void;
	resetTasks: () => void;
	updateTaskDueDate: (taskId: number, dueDate: string | null, dueTime?: string | null) => void;
	setFilteredTasks: (filters: FilterOptions) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
	tasks: [],
	categories: [],
	activeTaskIds: [],
	filteredTasks: [],
	setTasks: (tasks) =>
		set((state) => ({
			tasks: tasks.map((task) => ({
				...task,
				category: task.categoryId
					? state.categories.find((cat) => cat.id === task.categoryId)
					: undefined,
			})),
		})),
	updateTask: (updatedTask) =>
		set((state) => ({
			tasks: state.tasks.map((task) =>
				task.id === updatedTask.id
					? {
						...updatedTask,
						category: updatedTask.categoryId
							? state.categories.find((cat) => cat.id === updatedTask.categoryId)
							: undefined,
					}
					: task
			),
		})),
	addTask: (task) =>
		set((state) => ({
			tasks: [
				...state.tasks,
				{
					...task,
					category: task.categoryId
						? state.categories.find((cat) => cat.id === task.categoryId)
						: undefined,
				},
			],
		})),
	deleteTask: (taskId) =>
		set((state) => ({
			tasks: state.tasks.filter((task) => task.id !== taskId),
		})),
	updateTaskAccessLevel: (taskId, newAccessLevel) =>
		set((state) => ({
			tasks: state.tasks.map((task) =>
				task.id === taskId ? { ...task, accessLevel: newAccessLevel } : task
			),
		})),
	setCategories: (categories) =>
		set((state) => ({
			categories,
			tasks: state.tasks.map((task) => ({
				...task,
				category: task.categoryId
					? categories.find((cat) => cat.id === task.categoryId)
					: undefined,
			})),
		})),
	updateCategories: (updatedCategories) =>
		set((state) => ({
			categories: updatedCategories,
			tasks: state.tasks.map((task) => ({
				...task,
				category: task.categoryId
					? updatedCategories.find((cat) => cat.id === task.categoryId)
					: undefined,
			})),
		})),
	deleteCategory: (categoryId) =>
		set((state) => ({
			categories: state.categories.filter((cat) => cat.id !== categoryId),
		})),
	setActiveTaskIds: (taskIds) => set({ activeTaskIds: taskIds }),
	resetTasks: () => set({ tasks: [], activeTaskIds: [], categories: [] }),
	updateTaskDueDate: (taskId, dueDate) =>
		set((state) => ({
			tasks: state.tasks.map((task) =>
				task.id === taskId
					? { ...task, dueDate }
					: task
			),
		})),
	setFilteredTasks: (filters) =>
		set((state) => {
			let filtered = [...state.tasks];

			// Поиск по заголовку и описанию
			if (filters.query) {
				const query = filters.query.toLowerCase();
				filtered = filtered.filter(
					(task) =>
						task.title.toLowerCase().includes(query) ||
						(task.description && task.description.toLowerCase().includes(query))
				);
			}

			// Фильтр по статусу
			if (filters.status) {
				filtered = filtered.filter((task) => task.status === filters.status);
			}

			// Фильтр по приоритету
			if (filters.priority) {
				filtered = filtered.filter((task) => task.priority === filters.priority);
			}

			// Фильтр по категории
			if (filters.categoryId) {
				filtered = filtered.filter((task) => task.categoryId === Number(filters.categoryId));
			}

			// Фильтр по сроку выполнения
			if (filters.dueDateFilter) {
				const today = startOfDay(new Date());
				switch (filters.dueDateFilter) {
					case 'today':
						filtered = filtered.filter(
							(task) => task.dueDate && startOfDay(parseISO(task.dueDate)).getTime() === today.getTime()
						);
						break;
					case 'week':
						filtered = filtered.filter(
							(task) =>
								task.dueDate &&
								startOfDay(parseISO(task.dueDate)) >= today &&
								startOfDay(parseISO(task.dueDate)) <= addDays(today, 7)
						);
						break;
					case 'overdue':
						filtered = filtered.filter(
							(task) => task.dueDate && startOfDay(parseISO(task.dueDate)) < today
						);
						break;
					case 'noDate':
						filtered = filtered.filter((task) => !task.dueDate);
						break;
				}
			}

			// Фильтр по роли
			if (filters.accessLevel) {
				filtered = filtered.filter((task) => task.accessLevel === filters.accessLevel);
			}

			// Фильтр "Мои задачи"
			if (filters.myTasks) {
				filtered = filtered.filter((task) => task.accessLevel && task.accessLevel === AccessLevel.OWNER);
			}

			// Фильтр по пользователю, поделившемуся задачей
			if (filters.sharedByUsername) {
				filtered = filtered.filter(
					(task) => task.ownerName === filters.sharedByUsername
				);
			}

			return { filteredTasks: filtered };
		}),
}));
