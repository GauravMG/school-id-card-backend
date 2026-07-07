import { PageSize } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export const listExportSettings = async () => {
    return prisma.exportSetting.findMany({
        orderBy: { pageSize: 'asc' }
    });
};

export const listActiveExportSettings = async () => {
    return prisma.exportSetting.findMany({
        where: { isActive: true },
        orderBy: { pageSize: 'asc' }
    });
};

export const getExportSetting = async (id: string) => {
    return prisma.exportSetting.findUnique({ where: { id } });
};

export const getExportSettingForPageSize = async (pageSize: PageSize) => {
    return prisma.exportSetting.findUnique({ where: { pageSize } });
};

export const createExportSetting = async (data: { pageSize: PageSize; cardsPerPage: number }) => {
    return prisma.exportSetting.create({ data });
};

export const updateExportSetting = async (
    id: string,
    data: { cardsPerPage?: number; isActive?: boolean; showCropMarks?: boolean }
) => {
    return prisma.exportSetting.update({ where: { id }, data });
};

export const deleteExportSetting = async (id: string) => {
    return prisma.exportSetting.delete({ where: { id } });
};
