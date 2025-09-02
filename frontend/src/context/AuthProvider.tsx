"use client";

import { createContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWebSocket } from "@/hooks/useWebSocket";
import { checkAuth, login as loginService, logout as logoutService } from "@/services/authService";
import { useNotificationStore } from "@/stores/notificationStore";
import { useTaskStore } from "@/stores/taskStore";
import { disconnectWebSocket } from "@/hooks/websocket";
import Loading from "@/components/Loading";
import { Role } from "@/types/userProfile";

interface User {
	id: number;
	username: string;
	role: Role;
}

interface AuthContextType {
	user: User | null;
	login: (username: string, password: string) => Promise<boolean>;
	logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
	children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	useWebSocket(user?.id || 0);

	useEffect(() => {
		const verifyAuth = async () => {
			try {
				const userData = await checkAuth();
				setUser({ id: userData.id, username: userData.username, role: userData.role });
			} catch {
				setUser(null);
			} finally {
				setIsLoading(false);
			}
		};

		verifyAuth();
	}, []);

	const login = async (username: string, password: string) => {
		try {
			const userData = await loginService(username, password);
			setUser({ id: userData.id, username: userData.username, role: userData.role });
			const redirectPath = new URLSearchParams(window.location.search).get("redirect") || "/me";
			// console.time("Redirect to me");
			router.push(redirectPath);
			return true;
		} catch {
			return false;
		}
	};

	const logout = async () => {
		try {
			await logoutService();
			useNotificationStore.getState().resetNotifications();
			useTaskStore.getState().resetTasks();
			disconnectWebSocket();
			setUser(null);
			router.replace("/login");
		} catch {
			router.replace("/login");
		}
	};

	// Пока проверяем авторизацию, ничего не рендерим
	if (isLoading) {
		return <Loading />;
	}

	return (
		<AuthContext.Provider value={{ user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthProvider;
