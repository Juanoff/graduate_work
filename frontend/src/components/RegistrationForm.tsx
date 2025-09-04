"use client";

import { useState } from "react";

const RegistrationForm = () => {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		if (password !== confirmPassword) {
			setError("Пароли не совпадают");
			return;
		}

		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, email, password }),
			});

			if (response.ok) {
				setSuccess("Регистрация успешна! Теперь войдите.");
				setUsername("");
				setEmail("");
				setPassword("");
				setConfirmPassword("");
			} else {
				const text = await response.text();
				setError(text || "Ошибка при регистрации");
			}
		} catch (error) {
			setError("Error: " + error);
		}
	};

	return (
		<div className="flex items-center justify-center h-screen bg-gray-100">
			<div className="bg-white p-6 rounded-lg shadow-md w-96">
				<h2 className="text-xl font-bold mb-4">Регистрация</h2>
				{error && <p className="text-red-500 mb-2">{error}</p>}
				{success && <p className="text-green-500 mb-2">{success}</p>}
				<form onSubmit={handleSubmit}>
					<input
						type="text"
						placeholder="Логин"
						className="w-full p-2 border rounded mb-2"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
					<input
						type="email"
						placeholder="Email"
						className="w-full p-2 border rounded mb-2"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<input
						type="password"
						placeholder="Пароль"
						className="w-full p-2 border rounded mb-2"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<input
						type="password"
						placeholder="Подтвердите пароль"
						className="w-full p-2 border rounded mb-2"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
					/>
					<button className="w-full bg-blue-500 text-white p-2 rounded">
						Зарегистрироваться
					</button>
				</form>

				<div className="mt-4 text-center">
					<span className="text-gray-600">Уже есть аккаунт?</span>
					<a
						href="/login"
						className="ml-2 text-blue-500 hover:underline"
					>
						Войти
					</a>
				</div>
			</div>
		</div>
	);
};

export default RegistrationForm;
