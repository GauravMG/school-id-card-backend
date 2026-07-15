import dotenv from 'dotenv';
import type { StringValue } from 'ms';

dotenv.config();

export const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: Number(process.env.PORT || 4000),

    APP_URL: process.env.APP_URL || 'http://localhost:4000',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

    DATABASE_URL: process.env.DATABASE_URL || '',

    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || '',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',

    JWT_ACCESS_EXPIRES_IN:
        (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as StringValue,

    JWT_REFRESH_EXPIRES_IN:
        (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as StringValue,

    SUPERADMIN_EMAIL: process.env.SUPERADMIN_EMAIL || 'admin@example.com',
    SUPERADMIN_PASSWORD: process.env.SUPERADMIN_PASSWORD || 'Admin@12345',

    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || '',
    COOKIE_SECURE: process.env.COOKIE_SECURE === 'true',

    MAX_FILE_SIZE_IMAGE_MB: Number(process.env.MAX_FILE_SIZE_IMAGE_MB || 8),
    MAX_FILE_SIZE_LOGO_MB: Number(process.env.MAX_FILE_SIZE_LOGO_MB || 5),
    MAX_FILE_SIZE_CSV_MB: Number(process.env.MAX_FILE_SIZE_CSV_MB || 10)
};
