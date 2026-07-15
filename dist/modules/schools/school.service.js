"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSchoolById = exports.listSchools = exports.updateSchool = exports.createSchool = void 0;
const prisma_1 = require("../../lib/prisma");
const slug_1 = require("../../lib/slug");
const ApiError_1 = require("../../utils/ApiError");
const createSchool = async (body) => {
    return prisma_1.prisma.school.create({
        data: {
            name: body.name,
            contactPerson: body.contactPerson,
            email: body.email,
            phone: body.phone,
            address: body.address,
            brandColor: body.brandColor,
            secondaryColor: body.secondaryColor || null,
            selectedTemplateId: body.selectedTemplateId,
            publicSlug: body.publicSlug || (0, slug_1.uniqueSlug)(body.name),
            isActive: body.isActive ?? true
        }
    });
};
exports.createSchool = createSchool;
const updateSchool = async (schoolId, body) => {
    const school = await prisma_1.prisma.school.findUnique({ where: { id: schoolId } });
    if (!school)
        throw new ApiError_1.ApiError(404, 'School not found');
    return prisma_1.prisma.school.update({
        where: { id: schoolId },
        data: body
    });
};
exports.updateSchool = updateSchool;
const listSchools = async () => {
    return prisma_1.prisma.school.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            users: { select: { id: true, name: true, email: true, isActive: true } },
            students: { select: { id: true } },
            logoFile: true,
            uniformBoyFile: true,
            uniformGirlFile: true
        }
    });
};
exports.listSchools = listSchools;
const getSchoolById = async (schoolId) => {
    const school = await prisma_1.prisma.school.findUnique({
        where: { id: schoolId },
        include: {
            logoFile: true,
            uniformBoyFile: true,
            uniformGirlFile: true,
            users: true
        }
    });
    if (!school)
        throw new ApiError_1.ApiError(404, 'School not found');
    return school;
};
exports.getSchoolById = getSchoolById;
