import { Response } from "express";

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

const baseOptions = {
    httpOnly: true,                                 // JavaScript can't read it (XSS-safe)
    secure: process.env.NODE_ENV === 'production',  // HTTPS only in
    sameSite: 'lax' as const,                       // not sent on cross-site POST requests (CSRF)
};

export function setAuthCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
    ttl: { accessSeconds: number; refreshSeconds: number },
) {
    res.cookie(ACCESS_COOKIE, tokens.accessToken, {
        ...baseOptions,
        path: '/',
        maxAge: ttl.accessSeconds * 1000,
    });
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
        ...baseOptions,
        path: '/auth',
        maxAge: ttl.refreshSeconds * 1000,
    });
}

export function clearAuthCookies(res: Response) {
    res.clearCookie(ACCESS_COOKIE, { ...baseOptions, path: '/' });
    res.clearCookie(REFRESH_COOKIE, { ...baseOptions, path: '/auth' });
}