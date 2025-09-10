"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import PasswordInput from "./PasswordInput";

const LoginForm = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const auth = useAuth();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!auth) {
			setError("Авторизация недоступна.");
			return;
		}

		setIsSubmitting(true);
		setError("");
		const success = await auth.login(username, password);

		if (!success) {
			setError("Неверный логин или пароль.");
		}

		setIsSubmitting(false);
	};

	return (
		<div className="flex items-center rounded-lg justify-center h-screen bg-gray-100">
			<div className="bg-white p-6 rounded-lg shadow-md w-96">
				<h2 className="text-xl font-bold mb-4">Вход</h2>

				<form onSubmit={handleSubmit} className="space-y-3">
					<div>
						<input
							type="text"
							placeholder="Логин"
							className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${error ? "border-red-500" : "border-gray-300"
								}`}
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
					</div>

					<div className="relative">
						<PasswordInput
							placeholder="Пароль"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							error={error}
						/>
					</div>

					{error && <p className="text-red-500 text-sm">{error}</p>}

					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
					>
						{isSubmitting ? "Входим..." : "Войти"}
					</button>
				</form>

				<div className="mt-4 text-center">
					<span className="text-gray-600">Нет аккаунта?</span>
					<Link
						href="/register"
						className="ml-2 text-blue-500 hover:underline"
					>
						Зарегистрироваться
					</Link>
				</div>
			</div>
		</div>
	);
};

export default LoginForm;
