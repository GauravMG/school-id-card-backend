"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTemplates = void 0;
const prisma_1 = require("../../lib/prisma");
const listTemplates = async () => {
    return prisma_1.prisma.cardTemplate.findMany({
        where: { isActive: true },
        select: { id: true, name: true, description: true, sortOrder: true },
        orderBy: { sortOrder: 'asc' }
    });
};
exports.listTemplates = listTemplates;
