"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnToAdminController = exports.loginAsController = exports.meController = exports.logoutController = exports.refreshController = exports.loginController = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const ApiResponse_1 = require("../../utils/ApiResponse");
const auth_service_1 = require("./auth.service");
const cookie_1 = require("../../config/cookie");
const prisma_1 = require("../../lib/prisma");
const ApiError_1 = require("../../utils/ApiError");
exports.loginController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const data = await (0, auth_service_1.loginUser)(email, password, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
    });
    res.cookie(cookie_1.refreshCookieName, data.refreshToken, cookie_1.refreshCookieOptions);
    res.json((0, ApiResponse_1.apiResponse)('Login successful', {
        accessToken: data.accessToken,
        user: data.user
    }));
});
exports.refreshController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const token = req.cookies?.[cookie_1.refreshCookieName];
    if (!token)
        throw new ApiError_1.ApiError(401, 'Refresh token missing');
    const data = await (0, auth_service_1.refreshUserTokens)(token);
    res.cookie(cookie_1.refreshCookieName, data.refreshToken, cookie_1.refreshCookieOptions);
    res.json((0, ApiResponse_1.apiResponse)('Token refreshed', {
        accessToken: data.accessToken,
        user: data.user
    }));
});
exports.logoutController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const token = req.cookies?.[cookie_1.refreshCookieName];
    await (0, auth_service_1.logoutUser)(token);
    res.clearCookie(cookie_1.refreshCookieName, cookie_1.refreshCookieOptions);
    res.json((0, ApiResponse_1.apiResponse)('Logged out'));
});
exports.meController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: req.user.userId },
        include: { school: true }
    });
    res.json((0, ApiResponse_1.apiResponse)('Profile fetched', user));
});
exports.loginAsController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { schoolId } = req.body;
    const result = await (0, auth_service_1.loginAsSchool)(req.user.userId, schoolId, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
    });
    res.cookie(cookie_1.refreshCookieName, result.refreshToken, cookie_1.refreshCookieOptions);
    res.json((0, ApiResponse_1.apiResponse)('Logged in as school', {
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
exports.returnToAdminController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user?.userId)
        throw new ApiError_1.ApiError(401, 'Unauthorized');
    const originalSuperAdminId = req.user?.originalSuperAdminId;
    if (!originalSuperAdminId)
        throw new ApiError_1.ApiError(400, 'No admin session to restore');
    const result = await (0, auth_service_1.returnToAdmin)(req.user.userId, originalSuperAdminId, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
    });
    res.cookie(cookie_1.refreshCookieName, result.refreshToken, cookie_1.refreshCookieOptions);
    res.json((0, ApiResponse_1.apiResponse)('Returned to admin', {
        accessToken: result.accessToken,
        user: result.user
    }));
});
