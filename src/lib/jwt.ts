import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export type AccessTokenPayload = {
    userId: string;
    role: 'SUPERADMIN' | 'SCHOOL_STAFF';
    schoolId?: string | null;
    actingAsSchoolId?: string | null;
    actingAsStaffId?: string | null;
    originalSuperAdminId?: string | null;
};

export const signAccessToken = (payload: AccessTokenPayload) =>
    jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });

export const signRefreshToken = (payload: { userId: string }) =>
    jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });

export const verifyAccessToken = (token: string) =>
    jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;

export const verifyRefreshToken = (token: string) =>
    jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
