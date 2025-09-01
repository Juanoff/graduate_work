export const checkAuth = async () => {
	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
		method: "GET",
		credentials: "include",
	});

	if (!response.ok) throw new Error("Not authenticated");
	return response.json();
};

export const login = async (username: string, password: string) => {
	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ username, password }),
		credentials: "include",
	});

	if (!response.ok) throw new Error("Login failed");
	return response.json();
};

export const logout = async () => {
	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
		method: "POST",
		credentials: "include",
	});
	
	if (!response.ok) throw new Error("Logout failed");
};
