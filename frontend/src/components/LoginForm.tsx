"use client";

import { useState } from "react";
import { useAuth } from "@/context/useAuth";

const LoginForm = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const auth = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!auth) {
			setError("Контекст авторизации недоступен");
			return;
		}

		console.log("Submitting login form with:", { username, password });
		const success = await auth.login(username, password);
		console.log("Login result:", success);
		if (!success) {
			setError("Неверные данные!");
		} else {
			console.log("Login successful, redirecting...");
			// Редирект уже в AuthProvider, здесь ничего не нужно
		}
	};

	return (
		<div className="flex items-center justify-center h-screen bg-gray-100">
			<div className="bg-white p-6 rounded-lg shadow-md w-96">
				<h2 className="text-xl font-bold mb-4">Вход</h2>
				{error && <p className="text-red-500">{error}</p>}
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
					<button className="w-full bg-blue-500 text-white p-2 rounded">
						Войти
					</button>
				</form>

				<div className="mt-4 text-center">
					<span className="text-gray-600">Нет аккаунта?</span>
					<button
						className="ml-2 text-blue-500 hover:underline"
						onClick={() => alert("Перейти на страницу регистрации")}
					>
						Зарегистрироваться
					</button>
				</div>
			</div>
		</div>
	);
};

export default LoginForm;
