import { prisma } from '../../lib/prisma';

export const listAuditLogs = async (schoolId?: string) => {
    return prisma.auditLog.findMany({
        where: schoolId ? { schoolId } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
            actorUser: { select: { id: true, name: true, email: true } },
            school: { select: { id: true, name: true } }
        },
        take: 200
    });
};
