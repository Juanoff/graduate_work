"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode, useState } from "react";
import { registrationSchema, RegistrationFormData } from "@/schemas/registrationSchema";
import Link from "next/link";
import PasswordInput from "./PasswordInput";

const RegistrationForm = () => {
	const [serverError, setServerError] = useState<string | null>(null);
	const [success, setSuccess] = useState<ReactNode>("");

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<RegistrationFormData>({
		resolver: zodResolver(registrationSchema),
	});

	const onSubmit = async (data: RegistrationFormData) => {
		setServerError(null);
		setSuccess("");

		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username: data.username,
					email: data.email,
					password: data.password,
				}),
			});

			if (response.ok) {
				setSuccess(
					<>
						Регистрация успешна! Теперь{" "}
						<Link
							href="/login"
							className="text-green-600 hover:underline font-medium"
						>
							войдите
						</Link>.
					</>
				);
				reset();
			} else {
				const errorData = await response.json().catch(() => null);

				if (errorData?.errors) {
					setServerError(Object.values(errorData.errors).join(", "));
				} else if (errorData?.message) {
					setServerError(errorData.message);
				} else {
					setServerError("Неизвестная ошибка при регистрации");
				}
			}
		} catch (err) {
			setServerError("Ошибка: " + (err as Error).message);
		}
	};

	return (
		<div className="flex items-center rounded-lg justify-center h-screen bg-gray-100">
			<div className="bg-white p-6 rounded-lg shadow-md w-96">
				<h2 className="text-xl font-bold mb-4">Регистрация</h2>

				{serverError && <p className="text-red-500 mb-2">{serverError}</p>}
				{success && <p className="text-green-500 mb-2">{success}</p>}

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
					<div>
						<input
							type="text"
							placeholder="Логин"
							{...register("username")}
							className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.username ? "border-red-500" : "border-gray-300"
								}`}
						/>
						{errors.username && (
							<p className="text-red-500 text-sm">{errors.username.message}</p>
						)}
					</div>

					<div>
						<input
							type="email"
							placeholder="Email"
							{...register("email")}
							className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.email ? "border-red-500" : "border-gray-300"
								}`}
						/>
						{errors.email && (
							<p className="text-red-500 text-sm">{errors.email.message}</p>
						)}
					</div>

					<div>
						<PasswordInput
							placeholder="Пароль"
							{...register("password")}
							error={errors.password?.message}
						/>
					</div>

					<div>
						<PasswordInput
							placeholder="Подтвердите пароль"
							{...register("confirmPassword")}
							error={errors.confirmPassword?.message}
						/>
					</div>

					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
					>
						{isSubmitting ? "Загрузка..." : "Зарегистрироваться"}
					</button>
				</form>

				<div className="mt-4 text-center">
					<span className="text-gray-600">Уже есть аккаунт?</span>
					<a href="/login" className="ml-2 text-blue-500 hover:underline">
						Войти
					</a>
				</div>
			</div>
		</div>
	);
};

export default RegistrationForm;
