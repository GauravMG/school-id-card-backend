import { CookieOptions } from 'express';
import { env } from './env';

export const refreshCookieName = 'refresh_token';

export const refreshCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'lax',
    path: '/api/auth/refresh',
    domain: env.COOKIE_DOMAIN || undefined
};
