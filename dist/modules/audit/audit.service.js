"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAuditLogs = void 0;
const prisma_1 = require("../../lib/prisma");
const listAuditLogs = async (schoolId) => {
    return prisma_1.prisma.auditLog.findMany({
        where: schoolId ? { schoolId } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
            actorUser: { select: { id: true, name: true, email: true } },
            school: { select: { id: true, name: true } }
        },
        take: 200
    });
};
exports.listAuditLogs = listAuditLogs;
