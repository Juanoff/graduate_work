"use client";

import { createContext, useState, ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
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

const publicPaths = ["/login", "/register"];

const AuthProvider = ({ children }: AuthProviderProps) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();
	const pathname = usePathname();

	useWebSocket(user?.id || 0);

	useEffect(() => {
		const verifyAuth = async () => {
			try {
				const userData = await checkAuth();
				setUser({ id: userData.id, username: userData.username, role: userData.role });

				if (publicPaths.includes(pathname)) {
					router.push("/me");
				}
			} catch (error) {
				console.error("Auth check failed:", error);
				setUser(null);

				if (!publicPaths.includes(pathname)) {
					console.log("Redirecting to login from AuthProvider");
					const redirect = pathname;
					router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
				}
			} finally {
				setIsLoading(false);
			}
		};

		verifyAuth();
	}, [pathname, router]);

	const login = async (username: string, password: string) => {
		try {
			setIsLoading(true);
			const userData = await loginService(username, password);
			setUser({ id: userData.id, username: userData.username, role: userData.role });

			const searchParams = new URLSearchParams(window.location.search);
			const redirectPath = searchParams.get("redirect") || "/me";
			router.push(redirectPath);
			return true;
		} catch (error) {
			console.error("Login failed:", error);
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	const logout = async () => {
		try {
			setIsLoading(true);
			await logoutService();
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			useNotificationStore.getState().resetNotifications();
			useTaskStore.getState().resetTasks();
			disconnectWebSocket();
			setUser(null);
			router.push("/login");
			setIsLoading(false);
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
