"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshCookieOptions = exports.refreshCookieName = void 0;
const env_1 = require("./env");
exports.refreshCookieName = 'refresh_token';
exports.refreshCookieOptions = {
    httpOnly: true,
    secure: env_1.env.COOKIE_SECURE,
    sameSite: 'lax',
    path: '/api/auth/refresh',
    domain: env_1.env.COOKIE_DOMAIN || undefined
};
