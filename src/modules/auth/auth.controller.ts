import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { apiResponse } from '../../utils/ApiResponse';
import { loginAsSchool, loginUser, logoutUser, refreshUserTokens, returnToAdmin } from './auth.service';
import { refreshCookieName, refreshCookieOptions } from '../../config/cookie';
import { signAccessToken } from '../../lib/jwt';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';
import { createAuditLog } from '../../services/audit-log.service';
import { AuditAction } from '@prisma/client';

export const loginController = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const data = await loginUser(email, password, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
    });

    res.cookie(refreshCookieName, data.refreshToken, refreshCookieOptions);

    res.json(apiResponse('Login successful', {
        accessToken: data.accessToken,
        user: data.user
    }));
});

export const refreshController = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.[refreshCookieName];
    if (!token) throw new ApiError(401, 'Refresh token missing');

    const data = await refreshUserTokens(token);
    res.cookie(refreshCookieName, data.refreshToken, refreshCookieOptions);

    res.json(apiResponse('Token refreshed', {
        accessToken: data.accessToken,
        user: data.user
    }));
});

export const logoutController = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.[refreshCookieName];
    await logoutUser(token);
    res.clearCookie(refreshCookieName, refreshCookieOptions);
    res.json(apiResponse('Logged out'));
});

export const meController = asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        include: { school: true }
    });
    res.json(apiResponse('Profile fetched', user));
});

export const loginAsController = asyncHandler(async (req: Request, res: Response) => {
    const { schoolId } = req.body;

    const result = await loginAsSchool(req.user!.userId, schoolId, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
    });

    res.cookie(refreshCookieName, result.refreshToken, refreshCookieOptions);

    res.json(apiResponse('Logged in as school', {
        accessToken: result.accessToken,
        school: result.school,
        staff: result.staff,
        superAdmin: {
            id: result.superAdmin.id,
            name: result.superAdmin.name,
            email: result.superAdmin.email
        }
    }));
});

export const returnToAdminController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.userId) throw new ApiError(401, 'Unauthorized');

    const originalSuperAdminId = req.user?.originalSuperAdminId;
    if (!originalSuperAdminId) throw new ApiError(400, 'No admin session to restore');

    const result = await returnToAdmin(req.user.userId, originalSuperAdminId, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
    });

    res.cookie(refreshCookieName, result.refreshToken, refreshCookieOptions);

    res.json(apiResponse('Returned to admin', {
        accessToken: result.accessToken,
        user: result.user
    }));
});
