"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnToAdmin = exports.loginAsSchool = exports.logoutUser = exports.refreshUserTokens = exports.loginUser = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../lib/prisma");
const bcrypt_1 = require("../../lib/bcrypt");
const jwt_1 = require("../../lib/jwt");
const ApiError_1 = require("../../utils/ApiError");
const refresh_token_service_1 = require("../../services/refresh-token.service");
const audit_log_service_1 = require("../../services/audit-log.service");
const loginUser = async (email, password, meta) => {
    const user = await prisma_1.prisma.user.findUnique({ where: { email }, include: { school: true } });
    if (!user || !user.isActive)
        throw new ApiError_1.ApiError(401, 'Invalid credentials');
    const valid = await (0, bcrypt_1.compareValue)(password, user.passwordHash);
    if (!valid)
        throw new ApiError_1.ApiError(401, 'Invalid credentials');
    const accessToken = (0, jwt_1.signAccessToken)({
        userId: user.id,
        role: user.role,
        schoolId: user.schoolId
    });
    const refreshToken = (0, jwt_1.signRefreshToken)({ userId: user.id });
    await (0, refresh_token_service_1.storeRefreshToken)(user.id, refreshToken);
    await (0, audit_log_service_1.createAuditLog)({
        actorUserId: user.id,
        schoolId: user.schoolId,
        action: client_1.AuditAction.LOGIN,
        entityType: 'USER',
        entityId: user.id,
        metadata: { email: user.email },
        ipAddress: meta.ip,
        userAgent: meta.userAgent
    });
    return {
        user,
        accessToken,
        refreshToken
    };
};
exports.loginUser = loginUser;
const refreshUserTokens = async (refreshToken) => {
    const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
    const stored = await (0, refresh_token_service_1.findActiveRefreshToken)(refreshToken);
    if (!stored || stored.status !== 'ACTIVE' || stored.userId !== payload.userId) {
        throw new ApiError_1.ApiError(401, 'Invalid refresh token');
    }
    await (0, refresh_token_service_1.revokeRefreshToken)(refreshToken);
    const accessToken = (0, jwt_1.signAccessToken)({
        userId: stored.user.id,
        role: stored.user.role,
        schoolId: stored.user.schoolId
    });
    const nextRefreshToken = (0, jwt_1.signRefreshToken)({ userId: stored.user.id });
    await (0, refresh_token_service_1.storeRefreshToken)(stored.user.id, nextRefreshToken);
    return {
        accessToken,
        refreshToken: nextRefreshToken,
        user: stored.user
    };
};
exports.refreshUserTokens = refreshUserTokens;
const logoutUser = async (refreshToken) => {
    if (refreshToken)
        await (0, refresh_token_service_1.revokeRefreshToken)(refreshToken);
};
exports.logoutUser = logoutUser;
const loginAsSchool = async (superAdminUserId, schoolId, meta) => {
    const superAdmin = await prisma_1.prisma.user.findUnique({
        where: { id: superAdminUserId }
    });
    if (!superAdmin || superAdmin.role !== client_1.UserRole.SUPERADMIN || !superAdmin.isActive) {
        throw new ApiError_1.ApiError(403, 'Forbidden');
    }
    const school = await prisma_1.prisma.school.findUnique({
        where: { id: schoolId }
    });
    if (!school || !school.isActive) {
        throw new ApiError_1.ApiError(404, 'School not found');
    }
    const staff = await prisma_1.prisma.user.findFirst({
        where: {
            schoolId,
            role: client_1.UserRole.SCHOOL_STAFF,
            isActive: true
        },
        orderBy: { createdAt: 'asc' }
    });
    if (!staff) {
        throw new ApiError_1.ApiError(404, 'No active staff found for this school');
    }
    const accessToken = (0, jwt_1.signAccessToken)({
        userId: staff.id,
        role: client_1.UserRole.SCHOOL_STAFF,
        schoolId: school.id,
        actingAsSchoolId: school.id,
        actingAsStaffId: staff.id,
        originalSuperAdminId: superAdmin.id
    });
    const refreshToken = (0, jwt_1.signRefreshToken)({ userId: staff.id });
    await (0, refresh_token_service_1.storeRefreshToken)(staff.id, refreshToken);
    await (0, audit_log_service_1.createAuditLog)({
        actorUserId: superAdmin.id,
        schoolId: school.id,
        action: client_1.AuditAction.IMPERSONATE_SCHOOL,
        entityType: 'SCHOOL',
        entityId: school.id,
        metadata: {
            mode: 'login-as',
            staffUserId: staff.id,
            staffEmail: staff.email,
            superAdminEmail: superAdmin.email
        },
        ipAddress: meta.ip,
        userAgent: meta.userAgent
    });
    return {
        accessToken,
        refreshToken,
        school,
        staff,
        superAdmin
    };
};
exports.loginAsSchool = loginAsSchool;
const returnToAdmin = async (currentUserId, originalSuperAdminId, meta) => {
    const admin = await prisma_1.prisma.user.findUnique({
        where: { id: originalSuperAdminId }
    });
    if (!admin || admin.role !== client_1.UserRole.SUPERADMIN || !admin.isActive) {
        throw new ApiError_1.ApiError(403, 'Invalid admin session');
    }
    const accessToken = (0, jwt_1.signAccessToken)({
        userId: admin.id,
        role: client_1.UserRole.SUPERADMIN,
        schoolId: null
    });
    const refreshToken = (0, jwt_1.signRefreshToken)({ userId: admin.id });
    await (0, refresh_token_service_1.storeRefreshToken)(admin.id, refreshToken);
    await (0, audit_log_service_1.createAuditLog)({
        actorUserId: currentUserId,
        schoolId: null,
        action: client_1.AuditAction.IMPERSONATE_SCHOOL,
        entityType: 'USER',
        entityId: admin.id,
        metadata: {
            mode: 'return-to-admin',
            restoredAdminId: admin.id
        },
        ipAddress: meta.ip,
        userAgent: meta.userAgent
    });
    return {
        user: admin,
        accessToken,
        refreshToken
    };
};
exports.returnToAdmin = returnToAdmin;
