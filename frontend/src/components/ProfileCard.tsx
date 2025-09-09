'use client';
import { UserProfile } from '@/types/userProfile';
import { useState } from 'react';
import { UserAvatar } from './UserAvatar';
import { useTranslation } from 'react-i18next';
import { useShowToast } from '@/utils/toast';

interface ProfileCardProps {
	user: UserProfile;
	isPublic?: boolean;
	canEditAvatar?: boolean;
}

export function ProfileCard({ user, isPublic = false, canEditAvatar = false }: ProfileCardProps) {
	const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl || null);
	const { t } = useTranslation();
	const showToast = useShowToast();

	const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const formData = new FormData();
		formData.append('avatar', file);

		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me/upload-avatar`, {
				method: 'POST',
				body: formData,
				credentials: 'include'
			});

			if (!res.ok) {
				const errorData = await res.json();
				console.log("ERROR: " + errorData);
				showToast('error', errorData.code || 'INTERNAL_SERVER_ERROR');
				return;
			}

			console.log("Почти дата !#");
			const data = await res.json();
			console.log("После даты !#");
			setAvatarUrl(data.url + '?' + new Date().getTime());
			console.log("Почти тост показали !#");
			showToast('success', 'UPLOAD_SUCCESS');
		} catch {
			showToast('error', 'INTERNAL_SERVER_ERROR');
			console.log("ERROR 500 MB!")
		}
	};

	return (
		<div className="flex flex-col items-center text-center">
			<div className="relative group">
				<UserAvatar
					username={user.username}
					avatarUrl={avatarUrl}
					useNextImage
					size={96}
					className="border-2 border-gray-200"
				/>

				{canEditAvatar && (
					<>
						<label
							htmlFor="avatarUpload"
							className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition cursor-pointer"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-8 w-8 text-white"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M3 7h2l2-3h10l2 3h2v13H3V7z"
								/>
								<circle cx="12" cy="13" r="3" />
							</svg>
						</label>
						<input
							id="avatarUpload"
							type="file"
							className="hidden"
							onChange={handleUpload}
							accept="image/*"
						/>
					</>
				)}
			</div>

			<h1 className="text-2xl font-bold text-gray-800 mt-4">{user.username}</h1>

			{user.bio && <p className="mt-2 text-gray-600">{user.bio}</p>}

			{!isPublic && user.email && (
				<p className="mt-1 text-sm text-gray-500">{user.email}</p>
			)}

			<p className="mt-2 text-sm text-gray-500">
				{t('TASKS_COUNT', { defaultValue: 'Задач: {{count}}', count: user.tasksCount })}
			</p>
		</div >
	);
}
