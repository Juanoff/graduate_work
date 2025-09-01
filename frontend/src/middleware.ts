import { NextResponse, NextRequest } from "next/server";

// Список публичных маршрутов, которые не требуют авторизации
const publicPaths = ["/login", "/register", "/api", "/_next", "/favicon.ico"];

// Функция проверки авторизации через сервер
async function isAuthenticated(req: NextRequest): Promise<boolean> {
	const sessionCookie = req.cookies.get("JSESSIONID");
	if (!sessionCookie) {
		return false;
	}

	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
			method: "GET",
			headers: {
				Cookie: `JSESSIONID=${sessionCookie.value}`,
			},
			credentials: "include",
		});

		console.log("Middleware auth check status:", response.status);
		return response.ok;
	} catch (error) {
		console.error("Middleware auth check error:", error);
		return false;
	}
}

export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	// Пропускаем публичные маршруты
	const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
	if (isPublicPath) {
		return NextResponse.next();
	}

	// Проверяем авторизацию
	const authenticated = await isAuthenticated(req);

	// Если пользователь не авторизован и пытается зайти на защищенный маршрут
	if (!authenticated) {
		const loginUrl = new URL("/login", req.url);
		loginUrl.searchParams.set("redirect", pathname);
		return NextResponse.redirect(loginUrl);
	}

	// Если пользователь авторизован, но пытается зайти на /login
	if (authenticated && pathname === "/login") {
		return NextResponse.redirect(new URL("/me", req.url));
	}

	// Продолжаем обработку запроса
	return NextResponse.next();
}

// Конфигурация matcher для исключения API, статических файлов и т.д.
export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
