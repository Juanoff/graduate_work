export const checkAuth = async () => {
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000);

		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
			method: "GET",
			credentials: "include",
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			throw new Error("Auth check failed");
		}

		return response.json();
	} catch (error) {
		console.error("Auth check error:", error);
		throw error;
	}
};

export const login = async (username: string, password: string) => {
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000);

		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ username, password }),
			credentials: "include",
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			throw new Error("Login failed");
		}

		return response.json();
	} catch (error) {
		console.error("Login error:", error);
		throw error;
	}
};

export const logout = async () => {
	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
		method: "POST",
		credentials: "include",
	});

	if (!response.ok) throw new Error("Logout failed");
};
