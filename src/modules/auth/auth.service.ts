import { UserRole, AuditAction } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { compareValue } from '../../lib/bcrypt';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt';
import { ApiError } from '../../utils/ApiError';
import { storeRefreshToken, revokeRefreshToken, findActiveRefreshToken } from '../../services/refresh-token.service';
import { createAuditLog } from '../../services/audit-log.service';

export const loginUser = async (email: string, password: string, meta: { ip?: string; userAgent?: string }) => {
    const user = await prisma.user.findUnique({ where: { email }, include: { school: true } });
    if (!user || !user.isActive) throw new ApiError(401, 'Invalid credentials');

    const valid = await compareValue(password, user.passwordHash);
    if (!valid) throw new ApiError(401, 'Invalid credentials');

    const accessToken = signAccessToken({
        userId: user.id,
        role: user.role as UserRole,
        schoolId: user.schoolId
    });

    const refreshToken = signRefreshToken({ userId: user.id });
    await storeRefreshToken(user.id, refreshToken);

    await createAuditLog({
        actorUserId: user.id,
        schoolId: user.schoolId,
        action: AuditAction.LOGIN,
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

export const refreshUserTokens = async (refreshToken: string) => {
    const payload = verifyRefreshToken(refreshToken);
    const stored = await findActiveRefreshToken(refreshToken);

    if (!stored || stored.status !== 'ACTIVE' || stored.userId !== payload.userId) {
        throw new ApiError(401, 'Invalid refresh token');
    }

    await revokeRefreshToken(refreshToken);

    const accessToken = signAccessToken({
        userId: stored.user.id,
        role: stored.user.role,
        schoolId: stored.user.schoolId
    });

    const nextRefreshToken = signRefreshToken({ userId: stored.user.id });
    await storeRefreshToken(stored.user.id, nextRefreshToken);

    return {
        accessToken,
        refreshToken: nextRefreshToken,
        user: stored.user
    };
};

export const logoutUser = async (refreshToken?: string) => {
    if (refreshToken) await revokeRefreshToken(refreshToken);
};

export const loginAsSchool = async (
    superAdminUserId: string,
    schoolId: string,
    meta: { ip?: string; userAgent?: string }
) => {
    const superAdmin = await prisma.user.findUnique({
        where: { id: superAdminUserId }
    });

    if (!superAdmin || superAdmin.role !== UserRole.SUPERADMIN || !superAdmin.isActive) {
        throw new ApiError(403, 'Forbidden');
    }

    const school = await prisma.school.findUnique({
        where: { id: schoolId }
    });

    if (!school || !school.isActive) {
        throw new ApiError(404, 'School not found');
    }

    const staff = await prisma.user.findFirst({
        where: {
            schoolId,
            role: UserRole.SCHOOL_STAFF,
            isActive: true
        },
        orderBy: { createdAt: 'asc' }
    });

    if (!staff) {
        throw new ApiError(404, 'No active staff found for this school');
    }

    const accessToken = signAccessToken({
        userId: staff.id,
        role: UserRole.SCHOOL_STAFF,
        schoolId: school.id,
        actingAsSchoolId: school.id,
        actingAsStaffId: staff.id,
        originalSuperAdminId: superAdmin.id
    });

    const refreshToken = signRefreshToken({ userId: staff.id });
    await storeRefreshToken(staff.id, refreshToken);

    await createAuditLog({
        actorUserId: superAdmin.id,
        schoolId: school.id,
        action: AuditAction.IMPERSONATE_SCHOOL,
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

export const returnToAdmin = async (
    currentUserId: string,
    originalSuperAdminId: string,
    meta: { ip?: string; userAgent?: string }
) => {
    const admin = await prisma.user.findUnique({
        where: { id: originalSuperAdminId }
    });

    if (!admin || admin.role !== UserRole.SUPERADMIN || !admin.isActive) {
        throw new ApiError(403, 'Invalid admin session');
    }

    const accessToken = signAccessToken({
        userId: admin.id,
        role: UserRole.SUPERADMIN,
        schoolId: null
    });

    const refreshToken = signRefreshToken({ userId: admin.id });
    await storeRefreshToken(admin.id, refreshToken);

    await createAuditLog({
        actorUserId: currentUserId,
        schoolId: null,
        action: AuditAction.IMPERSONATE_SCHOOL,
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
