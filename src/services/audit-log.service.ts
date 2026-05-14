import { AuditAction } from '@prisma/client';
import { prisma } from '../lib/prisma';

type LogInput = {
    actorUserId?: string | null;
    schoolId?: string | null;
    action: AuditAction;
    entityType: string;
    entityId?: string | null;
    metadata?: unknown;
    ipAddress?: string | null;
    userAgent?: string | null;
};

export const createAuditLog = async (input: LogInput) => {
    return prisma.auditLog.create({
        data: {
            actorUserId: input.actorUserId || null,
            schoolId: input.schoolId || null,
            action: input.action,
            entityType: input.entityType,
            entityId: input.entityId || null,
            metadata: input.metadata as any,
            ipAddress: input.ipAddress || null,
            userAgent: input.userAgent || null
        }
    });
};
