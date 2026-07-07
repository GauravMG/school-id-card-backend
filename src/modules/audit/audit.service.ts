import { Prisma, AuditAction, UserRole } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export interface AuditLogQuery {
    schoolId?: string;
    action?: string;
    entityType?: string;
    actorEmail?: string;
    portalType?: 'SUPERADMIN' | 'SCHOOL';
    dateFrom?: string;
    dateTo?: string;
    page?: string;
    limit?: string;
}

/**
 * "Portal type" isn't stored directly on AuditLog — it's derived from the
 * actor's role (SUPERADMIN vs SCHOOL_STAFF), which is exactly the
 * superadmin-portal vs school-portal distinction the client asked for.
 */
export const listAuditLogs = async (query: AuditLogQuery) => {
    const page = Math.max(parseInt(query.page || '1', 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit || '50', 10) || 50, 1), 200);
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};

    if (query.schoolId) where.schoolId = query.schoolId;
    if (query.action) where.action = query.action as AuditAction;
    if (query.entityType) where.entityType = query.entityType;

    if (query.dateFrom || query.dateTo) {
        where.createdAt = {
            ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
            ...(query.dateTo && { lte: new Date(query.dateTo) })
        };
    }

    const actorUserFilter: Prisma.UserWhereInput = {};
    if (query.portalType === 'SUPERADMIN') actorUserFilter.role = UserRole.SUPERADMIN;
    if (query.portalType === 'SCHOOL') actorUserFilter.role = UserRole.SCHOOL_STAFF;
    if (query.actorEmail) actorUserFilter.email = { contains: query.actorEmail, mode: 'insensitive' };
    if (Object.keys(actorUserFilter).length) where.actorUser = actorUserFilter;

    const [items, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            include: {
                actorUser: { select: { id: true, name: true, email: true, role: true } },
                school: { select: { id: true, name: true } }
            }
        }),
        prisma.auditLog.count({ where })
    ]);

    return {
        items,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
};

export const listAuditActionTypes = () => Object.values(AuditAction);
