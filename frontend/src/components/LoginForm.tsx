"use client";

import { useState } from "react";
import { useAuth } from "@/context/useAuth";
import Link from "next/link";

const LoginForm = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const auth = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!auth) {
			setError("Авторизация недоступна.");
			return;
		}

		setError("");
		const success = await auth.login(username, password);

		if (!success) {
			setError("Неверный логин или пароль.");
		}
	};

	return (
		<div className="flex items-center justify-center h-screen bg-gray-100">
			<div className="bg-white p-6 rounded-lg shadow-md w-96">
				<h2 className="text-xl font-bold mb-4">Вход</h2>

				<form onSubmit={handleSubmit}>
					<input
						type="text"
						placeholder="Логин"
						className="w-full p-2 border rounded mb-2"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
					<input
						type="password"
						placeholder="Пароль"
						className="w-full p-2 border rounded mb-2"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>

					{error && <p className="text-red-500">{error}</p>}

					<button
						type="submit"
						className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
					>
						Войти
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
