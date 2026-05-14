import { prisma } from '../../lib/prisma';

export const listTemplates = async () => {
    return prisma.cardTemplate.findMany({
        where: { isActive: true },
        select: { id: true, name: true, description: true, sortOrder: true },
        orderBy: { sortOrder: 'asc' }
    });
};
