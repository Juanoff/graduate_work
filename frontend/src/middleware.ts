import { NextResponse, NextRequest } from "next/server";

// Список публичных маршрутов, которые не требуют авторизации
const publicPaths = ["/login", "/register", "/api", "/_next", "/favicon.ico"];

export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	if (req.method === 'OPTIONS' || pathname.startsWith("/api/")) {
		return NextResponse.next();
	}

	// Пропускаем публичные маршруты
	const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
	if (isPublicPath) {
		return NextResponse.next();
	}

	// Продолжаем обработку запроса
	return NextResponse.next();
}

// Конфигурация matcher для исключения API, статических файлов и т.д.
export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
