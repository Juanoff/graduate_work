import { format, getYear, isPast, isToday, isTomorrow, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

export function getDueDateColor(dueDate?: string | null): string | null {
	if (!dueDate) return null;

	const parsedDate = parseISO(dueDate);
	if (isPast(parsedDate)) {
		return "text-red-600";
	}
	if (isToday(parsedDate)) {
		return "text-orange-500"; // animate-glow
	}
	return "text-gray-500";
}

export function formatDueDate(dueDate?: string | null): string | null {
	if (!dueDate) return null;

	const parsedDate = parseISO(dueDate);
	const currentYear = getYear(new Date());

	if (isToday(parsedDate)) {
		return `Сегодня в ${format(parsedDate, "HH:mm", {
			locale: ru,
		})}`;
	} else if (isTomorrow(parsedDate)) {
		return `Завтра в ${format(parsedDate, "HH:mm", {
			locale: ru,
		})}`;
	} else {
		const dueDateYear = getYear(parsedDate);
		const formatString = dueDateYear === currentYear ? "d MMMM" : "d MMMM yyyy";
		return format(parsedDate, formatString, { locale: ru });
	}
}

export function transformDueDate(dueDate?: string | null): string | null {
	if (!dueDate) return null;

	const parsedDate = parseISO(dueDate);
	const currentYear = getYear(new Date());

	if (isToday(parsedDate)) {
		return `Сегодня в ${format(parsedDate, "HH:mm", {
			locale: ru,
		})}`;
	} else if (isTomorrow(parsedDate)) {
		return `Завтра в ${format(parsedDate, "HH:mm", {
			locale: ru,
		})}`;
	} else {
		const dueDateYear = getYear(parsedDate);
		const formatString = dueDateYear === currentYear ? "d MMMM HH:mm" : "d MMMM yyyy HH:mm";
		return format(parsedDate, formatString, { locale: ru });
	}
}
