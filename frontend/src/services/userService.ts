import { UserProfile } from "@/types/userProfile";

export async function fetchUserByUsername(username: string): Promise<UserProfile | null>  {
	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}`, {
		credentials: "include",
		// Настройка кэширования: данные обновляются каждые 5 минут
		next: { revalidate: 300 },
	});

	if (!response.ok) {
		if (response.status === 404) return null;
		throw new Error('Failed to fetch user');
	}

	return response.json();
};

export const fetchAllUsernames = async (): Promise<string[]> => {
	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/usernames`);

	if (!res.ok) throw new Error("Не удалось получить список пользователей");
	
	return res.json();
};
