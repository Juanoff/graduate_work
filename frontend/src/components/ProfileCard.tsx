'use client';
import { UserProfile } from '@/types/userProfile';
import { useState } from 'react';
import { UserAvatar } from './UserAvatar';

interface ProfileCardProps {
	user: UserProfile;
	isPublic?: boolean;
	canEditAvatar?: boolean;
}

export function ProfileCard({ user, isPublic = false, canEditAvatar = false }: ProfileCardProps) {
	const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl || null);

	const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const formData = new FormData();
			formData.append('avatar', file);

			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me/upload-avatar`, {
				method: 'POST',
				body: formData,
			});

			const data = await res.json();
			setAvatarUrl(data.url);
		}
	};

	return (
		<div className="flex flex-col items-center text-center">
			<UserAvatar
				username={user.username}
				avatarUrl={avatarUrl}
				useNextImage
				size={96}
				className="border-2 border-gray-200"
			/>

			{canEditAvatar && (
				<label className="mt-2 cursor-pointer text-blue-500 hover:underline">
					Загрузить аватар
					<input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
				</label>
			)}

			<h1 className="text-2xl font-bold text-gray-800 mt-4">{user.username}</h1>

			{user.bio && <p className="mt-2 text-gray-600">{user.bio}</p>}

			{!isPublic && user.email && (
				<p className="mt-1 text-sm text-gray-500">{user.email}</p>
			)}

			<p className="mt-2 text-sm text-gray-500">Задач: {user.tasksCount}</p>
		</div>
	);
}
