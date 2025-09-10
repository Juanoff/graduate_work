"use client";

import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	error?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ error, ...props }) => {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<div className="relative">
			<input
				type={showPassword ? "text" : "password"}
				className={`w-full p-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${error ? "border-red-500" : "border-gray-300"
					}`}
				{...props}
			/>
			<button
				type="button"
				onClick={() => setShowPassword(!showPassword)}
				className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white"
				aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
			>
				<span
					className={`block transition-all duration-200 transform ${showPassword ? "rotate-180 opacity-80" : "rotate-0 opacity-100"
						}`}
				>
					{showPassword ? (
						<EyeSlashIcon className="w-5 h-5" />
					) : (
						<EyeIcon className="w-5 h-5" />
					)}
				</span>
			</button>
			{error && <p className="text-red-500 text-sm mt-1">{error}</p>}
		</div>
	);
};

export default PasswordInput;
