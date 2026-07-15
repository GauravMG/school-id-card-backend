"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listStaff = exports.updateStaff = exports.createStaff = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../lib/prisma");
const bcrypt_1 = require("../../lib/bcrypt");
const createStaff = async (schoolId, body) => {
    return prisma_1.prisma.user.create({
        data: {
            name: body.name,
            email: body.email,
            passwordHash: await (0, bcrypt_1.hashValue)(body.password),
            role: client_1.UserRole.SCHOOL_STAFF,
            schoolId
        }
    });
};
exports.createStaff = createStaff;
const updateStaff = async (staffId, body) => {
    const data = {
        name: body.name,
        email: body.email,
        isActive: body.isActive
    };
    if (body.password) {
        data.passwordHash = await (0, bcrypt_1.hashValue)(body.password);
    }
    return prisma_1.prisma.user.update({
        where: { id: staffId },
        data
    });
};
exports.updateStaff = updateStaff;
const listStaff = async (schoolId) => {
    return prisma_1.prisma.user.findMany({
        where: {
            schoolId,
            role: client_1.UserRole.SCHOOL_STAFF
        },
        orderBy: { createdAt: 'desc' }
    });
};
exports.listStaff = listStaff;
