"use client";

import { useAuth } from "@/context/useAuth";
import { PencilIcon } from "@heroicons/react/24/outline";
import LogoutIcon from '@mui/icons-material/Logout';
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProfileCard } from "@/components/ProfileCard";
import { useForm } from "react-hook-form";
import { UserProfile } from "@/types/userProfile";
import { zodResolver } from "@hookform/resolvers/zod";
import Loading from "@/components/Loading";
import { userUpdateSchema, UserUpdateForm } from "@/schemas/userUpdateSchema";
import { useShowToast } from "@/utils/toast";

const fetchUserProfile = async (): Promise<UserProfile> => {
	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
		credentials: "include",
	});

	if (!res.ok) throw new Error("Не удалось загрузить данные профиля");
	return res.json();
};

const updateProfile = async (data: UserUpdateForm): Promise<void> => {
	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
		credentials: "include",
	});

	if (!res.ok) {
		const errorData = await res.json();
		console.log("ERROR: " + errorData.error)
		console.log("ERROR MES: " + errorData.message)
		throw new Error(errorData.message || "Ошибка обновления профиля");
	}
};

export default function MePage() {
	const { user, logout } = useAuth();
	const queryClient = useQueryClient();
	const [editingField, setEditingField] = useState<string | null>(null);
	const showToast = useShowToast();

	const { data: profile, isLoading } = useQuery({
		queryKey: ["userProfile", user?.id],
		queryFn: fetchUserProfile,
		enabled: !!user,
	});

	const { register, handleSubmit, reset, formState: { errors, isValid, isDirty }, watch, clearErrors } = useForm<UserUpdateForm>({
		resolver: zodResolver(userUpdateSchema),
		mode: "onChange",
		defaultValues: {
			username: undefined,
			bio: undefined,
			email: undefined,
			currentPassword: undefined,
			newPassword: undefined,
		},
	});

	useEffect(() => {
		if (profile) {
			reset({
				username: profile.username,
				bio: profile.bio ?? null,
				email: profile.email,
				currentPassword: undefined,
				newPassword: undefined,
			});
		}
	}, [profile, reset]);

	const mutation = useMutation({
		mutationFn: updateProfile,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["userProfile", user?.id] });
			setEditingField(null);
			reset();
			clearErrors();
			showToast('success', "Профиль обновлен!");
		},
		onError: (error: Error) => {
			const message = error.message || "Произошла ошибка";
			if (message.includes("Username already exists")) {
				showToast('error', "Этот username уже занят");
			} else if (message.includes("Email already exists")) {
				showToast('error', "Этот email уже занят");
			} else {
				showToast('error', message);
			}
		},
	});

	// Следим за полями пароля для дополнительной проверки
	const currentPassword = watch("currentPassword");
	const newPassword = watch("newPassword");

	useEffect(() => {
		if (!currentPassword && !newPassword && editingField === "password") {
			clearErrors(["currentPassword", "newPassword"]);
		}
	}, [currentPassword, newPassword, editingField, clearErrors]);

	const onSubmit = (field: string) => handleSubmit((data) => {
		const updateData: UserUpdateForm = {};
		if (field === "username" && data.username) updateData.username = data.username;
		if (field === "bio") updateData.bio = data.bio;
		if (field === "email" && data.email) updateData.email = data.email;
		if (field === "password" && data.currentPassword && data.newPassword) {
			updateData.currentPassword = data.currentPassword;
			updateData.newPassword = data.newPassword;
		}

		if (Object.keys(updateData).length > 0) {
			mutation.mutate(updateData);
		}
	});

	if (!user || isLoading) return <Loading />;

	const isPasswordSectionValid = editingField === "password"
		? !!currentPassword && !!newPassword && isValid
		: isValid && isDirty;

	return (
		<div className="container mx-auto p-6 min-h-screen bg-gray-100 relative rounded-lg">
			<button
				onClick={logout}
				className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-white shadow-md rounded-full text-red-500  transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500"
				aria-label="Выйти из аккаунта"
			>
				<LogoutIcon fontSize="small" />
				<span className="hidden md:inline">Выйти</span>
			</button>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-lg p-6 mt-12"
			>
				<ProfileCard user={profile!} canEditAvatar={true} />

				<div className="mt-6 space-y-6">
					{/* Username */}
					<div>
						<div className="flex justify-between items-center">
							<label className="text-gray-800">Имя пользователя</label>
							{editingField !== "username" && (
								<button
									onClick={() => setEditingField("username")}
									className="text-blue-500 hover:text-blue-700 focus:outline-none focus:ring-0 transition duration-200 ease-in-out p-1"
									aria-label="Редактировать имя пользователя"
								>
									<PencilIcon className="w-4 h-4" />
								</button>
							)}
						</div>
						{editingField === "username" ? (
							<form onSubmit={onSubmit("username")} className="mt-2 space-y-2">
								<input
									{...register("username")}
									className={`w-full p-3 rounded-lg border ${errors.username ? "border-red-500" : "border-gray-300"
										} focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out`}
									autoComplete="off"
								/>
								{errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
								<div className="flex gap-2">
									<button
										type="submit"
										disabled={!isValid || !isDirty}
										className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus-visible:outline-none 
											focus-visible:ring-2 focus-visible:ring-blue-400 active:scale-95 transition-colors duration-200 ease-in-out 
											disabled:opacity-50 disabled:cursor-not-allowed"
										aria-label="Сохранить имя пользователя"
									>
										Сохранить
									</button>
									<button
										type="button"
										onClick={() => { setEditingField(null); reset(); }}
										className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 focus-visible:outline-none 
											focus-visible:ring-2 focus-visible:ring-gray-400 active:scale-95 transition-colors duration-200 ease-in-out"
										aria-label="Отменить редактирование"
									>
										Отмена
									</button>
								</div>
							</form>
						) : (
							<p className="text-gray-600 mt-1">{profile!.username}</p>
						)}
					</div>

					{/* Bio */}
					<div>
						<div className="flex justify-between items-center">
							<label className="text-gray-800">О себе</label>
							{editingField !== "bio" && (
								<button
									onClick={() => setEditingField("bio")}
									className="text-blue-500 hover:text-blue-700 focus:outline-none focus:ring-0 transition duration-200 ease-in-out p-1"
									aria-label="Редактировать описание"
								>
									<PencilIcon className="w-4 h-4" />
								</button>
							)}
						</div>
						{editingField === "bio" ? (
							<form onSubmit={onSubmit("bio")} className="mt-2 space-y-2">
								<textarea
									{...register("bio")}
									className={`w-full p-3 rounded-lg border resize-y min-h-[80px] max-h-[300px] ${errors.bio ? "border-red-500" : "border-gray-300"
										} focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out`}
									rows={3}
									maxLength={160}
								/>
								{errors.bio && <p className="text-red-500 text-sm">{errors.bio.message}</p>}
								<div className="flex gap-2">
									<button
										type="submit"
										disabled={!isValid || !isDirty}
										className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus-visible:outline-none 
											focus-visible:ring-2 focus-visible:ring-blue-400 active:scale-95 transition-colors duration-200 ease-in-out 
											disabled:opacity-50 disabled:cursor-not-allowed"
										aria-label="Сохранить описание"
									>
										Сохранить
									</button>
									<button
										type="button"
										onClick={() => { setEditingField(null); reset(); }}
										className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 focus-visible:outline-none 
											focus-visible:ring-2 focus-visible:ring-gray-400 active:scale-95 transition-colors duration-200 ease-in-out"
										aria-label="Отменить редактирование"
									>
										Отмена
									</button>
								</div>
							</form>
						) : (
							<p className="text-gray-600 mt-1">{profile!.bio || "Не указано"}</p>
						)}
					</div>

					{/* Email */}
					<div>
						<div className="flex justify-between items-center">
							<label className="text-gray-800">Email</label>
							{editingField !== "email" && (
								<button
									onClick={() => setEditingField("email")}
									className="text-blue-500 hover:text-blue-700 focus:outline-none focus:ring-0 transition duration-200 ease-in-out p-1"
									aria-label="Редактировать email"
								>
									<PencilIcon className="w-4 h-4" />
								</button>
							)}
						</div>
						{editingField === "email" ? (
							<form onSubmit={onSubmit("email")} className="mt-2 space-y-2">
								<input
									{...register("email")}
									type="email"
									className={`w-full p-3 rounded-lg border ${errors.email ? "border-red-500" : "border-gray-300"
										} focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out`}
									autoComplete="off"
								/>
								{errors.email && (
									<p className="text-red-500 text-sm">{errors.email.message}</p>
								)}
								<div className="flex gap-2">
									<button
										type="submit"
										disabled={!isValid || !isDirty}
										className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus-visible:outline-none 
											focus-visible:ring-2 focus-visible:ring-blue-400 active:scale-95 transition-colors duration-200 ease-in-out 
											disabled:opacity-50 disabled:cursor-not-allowed"
										aria-label="Сохранить email"
									>
										Сохранить
									</button>
									<button
										type="button"
										onClick={() => { setEditingField(null); reset(); }}
										className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 focus-visible:outline-none 
											focus-visible:ring-2 focus-visible:ring-gray-400 active:scale-95 transition-colors duration-200 ease-in-out"
										aria-label="Отменить редактирование"
									>
										Отмена
									</button>
								</div>
							</form>
						) : (
							<p className="text-gray-600 mt-1">{profile!.email}</p>
						)}
					</div>

					{/* Password */}
					<div>
						<div className="flex justify-between items-center">
							<label className="text-gray-800">Пароль</label>
							{editingField !== "password" && (
								<button
									onClick={() => setEditingField("password")}
									className="text-blue-500 hover:text-blue-700 focus:outline-none focus:ring-0 transition duration-200 ease-in-out p-1"
									aria-label="Редактировать пароль"
								>
									<PencilIcon className="w-4 h-4" />
								</button>
							)}
						</div>
						{editingField === "password" ? (
							<form onSubmit={onSubmit("password")} className="mt-2 space-y-2">
								<input
									{...register("currentPassword")}
									type="password"
									placeholder="Текущий пароль"
									className={`w-full p-3 rounded-lg border ${errors.currentPassword ? "border-red-500" : "border-gray-300"
										} focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out`}
									autoComplete="new-password"
								/>
								{errors.currentPassword && <p className="text-red-500 text-sm">{errors.currentPassword.message}</p>}
								<input
									{...register("newPassword")}
									type="password"
									placeholder="Новый пароль"
									className={`w-full p-3 rounded-lg border ${errors.newPassword ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
									autoComplete="new-password"
								/>
								{errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword.message}</p>}
								<div className="flex gap-2">
									<button
										type="submit"
										disabled={!isPasswordSectionValid}
										className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus-visible:outline-none 
											focus-visible:ring-2 focus-visible:ring-blue-400 active:scale-95 transition-colors duration-200 ease-in-out 
											disabled:opacity-50 
											disabled:cursor-not-allowed"
										aria-label="Сохранить пароль"
									>
										Сохранить
									</button>
									<button
										type="button"
										onClick={() => { setEditingField(null); reset(); }}
										className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 focus-visible:outline-none 
											focus-visible:ring-2 focus-visible:ring-gray-400 active:scale-95 transition-colors duration-200 ease-in-out"
										aria-label="Отменить редактирование"
									>
										Отмена
									</button>
								</div>
							</form>
						) : (
							<p className="text-gray-600 mt-1">••••••••</p>
						)}
					</div>
				</div>
			</motion.div>
		</div>
	);
}
