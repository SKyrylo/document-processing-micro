import { NextRequest, NextResponse } from "next/server";
import { type Cookie, parseSetCookie } from "set-cookie-parser";
import { toCookieOptions } from "./app/auth/cookie-options";

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';
const publicRoutes = ['/auth/login', '/auth/register']

// Refresh tokens are single-use, but one page load fires several requests at once
// (page, prefetches, ...). All of them carry the same old cookie, so they must share ONE refresh call.
const inFlight = new Map<string, Promise<Cookie[] | null>>();

function refreshTokens(refreshToken: string) {
    let promise = inFlight.get(refreshToken);
    if (!promise) {
        promise = fetch(`${process.env.API_URL}/auth/refresh`, {
            method: "POST",
            headers: { Cookie: `${REFRESH_COOKIE}=${refreshToken}` },
        })
            .then((res) => (res.ok ? parseSetCookie(res.headers.getSetCookie()) : null))
            .catch(() => null)
            .finally(() => setTimeout(() => inFlight.delete(refreshToken), 5_000)); // keep the result briefly for late parallel requests
        inFlight.set(refreshToken, promise);
    }
    return promise;
}

export async function proxy(request: NextRequest) {
    const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route));
    const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
    let authenticated = request.cookies.has(ACCESS_COOKIE);
    let newCookies: Cookie[] = [];

    // Access cookie expired (the browser deleted it) but the refresh cookie is still there -> get new tokens from Nest
    if (!authenticated && refreshToken) {
        newCookies = (await refreshTokens(refreshToken)) ?? [];
        authenticated = newCookies.some((c) => c.name === ACCESS_COOKIE);

        // make the fresh cookies visible to the pages/actions handling THIS request
        for (const c of newCookies) {
            request.cookies.set(c.name, c.value);
        }
    }

    if (!authenticated && !isPublicRoute) {
        const response = NextResponse.redirect(new URL('/auth/login', request.url));
        if (refreshToken) {
            response.cookies.delete({ name: REFRESH_COOKIE, path: '/auth' });
        }
        return response;
    }

    const response = NextResponse.next({ request });

    // ...and send them to the browser too
    for (const c of newCookies) {
        response.cookies.set(c.name, c.value, toCookieOptions(c));
    }
    return response;
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};