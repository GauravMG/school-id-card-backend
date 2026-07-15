"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLog = void 0;
const prisma_1 = require("../lib/prisma");
const createAuditLog = async (input) => {
    return prisma_1.prisma.auditLog.create({
        data: {
            actorUserId: input.actorUserId || null,
            schoolId: input.schoolId || null,
            action: input.action,
            entityType: input.entityType,
            entityId: input.entityId || null,
            metadata: input.metadata,
            ipAddress: input.ipAddress || null,
            userAgent: input.userAgent || null
        }
    });
};
exports.createAuditLog = createAuditLog;
