"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExportSetting = exports.updateExportSetting = exports.createExportSetting = exports.getExportSetting = exports.listActiveExportSettings = exports.listExportSettings = void 0;
const prisma_1 = require("../../lib/prisma");
const listExportSettings = async () => {
    return prisma_1.prisma.exportSetting.findMany({
        orderBy: { pageSize: 'asc' }
    });
};
exports.listExportSettings = listExportSettings;
const listActiveExportSettings = async () => {
    return prisma_1.prisma.exportSetting.findMany({
        where: { isActive: true },
        orderBy: { pageSize: 'asc' }
    });
};
exports.listActiveExportSettings = listActiveExportSettings;
const getExportSetting = async (id) => {
    return prisma_1.prisma.exportSetting.findUnique({ where: { id } });
};
exports.getExportSetting = getExportSetting;
const createExportSetting = async (data) => {
    return prisma_1.prisma.exportSetting.create({ data });
};
exports.createExportSetting = createExportSetting;
const updateExportSetting = async (id, data) => {
    return prisma_1.prisma.exportSetting.update({ where: { id }, data });
};
exports.updateExportSetting = updateExportSetting;
const deleteExportSetting = async (id) => {
    return prisma_1.prisma.exportSetting.delete({ where: { id } });
};
exports.deleteExportSetting = deleteExportSetting;
