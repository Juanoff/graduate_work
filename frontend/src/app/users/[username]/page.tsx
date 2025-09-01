import { ProfileCard } from '@/components/ProfileCard';
import { fetchUserByUsername } from '@/services/userService';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
	const username = params.username;
	const user = await fetchUserByUsername(username);

	if (!user) {
		return {
			title: 'Пользователь не найден',
		};
	}

	return {
		title: `${user.username} | Профиль пользователя`,
		description: user.bio || `Профиль пользователя ${user.username} в таск-трекере`,
	};
}

export default async function UserProfilePage(
	props: { params: Promise<{ username: string }> }
) {
	const { username } = await props.params;
	let user;

	try {
		user = await fetchUserByUsername(username);
	} catch {
		return (
			<div className="container mx-auto min-h-screen flex items-center justify-center">
				<div className="text-center text-gray-500 text-lg">
					Пользователь не найден или произошла ошибка
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="container mx-auto min-h-screen flex items-center justify-center">
				<div className="text-center text-gray-500 text-lg">Пользователь не найден</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 min-h-screen flex flex-col items-center bg-gray-50">
			<div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6">
				<ProfileCard user={user} isPublic />
			</div>
		</div>
	);
}
