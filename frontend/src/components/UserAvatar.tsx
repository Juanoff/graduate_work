'use client';
import Avatar from '@mui/material/Avatar';
import Image from 'next/image';

interface UserAvatarProps {
	username: string;
	avatarUrl?: string | null;
	size?: number;
	useNextImage?: boolean;
	className?: string;
}

export const UserAvatar = ({
	username,
	avatarUrl,
	size = 96,
	useNextImage = false,
	className = '',
}: UserAvatarProps) => {
	const initials = username[0]?.toUpperCase();

	if (avatarUrl) {
		if (useNextImage) {
			return (
				<Image
					src={avatarUrl}
					alt={username}
					width={size}
					height={size}
					className={`rounded-full object-cover ${className}`}
				/>
			);
		}

		return (
			<Avatar
				alt={username}
				src={avatarUrl}
				sx={{ width: size, height: size }}
				className={className}
			/>
		);
	}

	return (
		<Avatar
			sx={{
				width: size,
				height: size,
				fontSize: size / 3,
			}}
			className={className}
		>
			{initials}
		</Avatar>
	);
};
