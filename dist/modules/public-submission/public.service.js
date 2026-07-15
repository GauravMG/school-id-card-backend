"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitPublicStudent = exports.findStudentByRollNumber = exports.getPublicSchoolBySlug = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../lib/prisma");
const ApiError_1 = require("../../utils/ApiError");
const computeStatus = (data) => {
    const ok = !!(data.firstName && data.rollNumber && data.gender && data.classValue && data.sectionValue && data.photoFileId);
    if (ok)
        return { status: client_1.StudentStatus.COMPLETED, isDetailsCompleted: true };
    if (!data.photoFileId)
        return { status: client_1.StudentStatus.PHOTO_PENDING, isDetailsCompleted: false };
    return { status: client_1.StudentStatus.DETAILS_PENDING, isDetailsCompleted: false };
};
const getPublicSchoolBySlug = async (slug) => {
    const school = await prisma_1.prisma.school.findUnique({
        where: { publicSlug: slug },
        include: { logoFile: true, uniformBoyFile: true, uniformGirlFile: true }
    });
    if (!school || !school.isActive)
        throw new ApiError_1.ApiError(404, 'School not found');
    return school;
};
exports.getPublicSchoolBySlug = getPublicSchoolBySlug;
const findStudentByRollNumber = async (slug, rollNumber, classValue, sectionValue) => {
    const school = await (0, exports.getPublicSchoolBySlug)(slug);
    return prisma_1.prisma.student.findFirst({
        where: {
            schoolId: school.id,
            rollNumber,
            classValue: {
                equals: classValue,
                mode: 'insensitive'
            },
            sectionValue: {
                equals: sectionValue,
                mode: 'insensitive'
            }
        },
        include: {
            photoFile: true,
            compositeFile: true
        }
    });
};
exports.findStudentByRollNumber = findStudentByRollNumber;
const submitPublicStudent = async (slug, body) => {
    const school = await (0, exports.getPublicSchoolBySlug)(slug);
    const fullName = [body.firstName, body.lastName].filter(Boolean).join(' ').trim();
    const existing = await prisma_1.prisma.student.findUnique({
        where: {
            schoolId_rollNumber: {
                schoolId: school.id,
                rollNumber: body.rollNumber
            }
        }
    });
    const statusData = computeStatus(body);
    if (!existing) {
        return prisma_1.prisma.student.create({
            data: {
                schoolId: school.id,
                ...body,
                fullName,
                dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
                submittedFromPublic: true,
                isDetailsCompleted: statusData.isDetailsCompleted,
                status: statusData.status
            }
        });
    }
    return prisma_1.prisma.student.update({
        where: { id: existing.id },
        data: {
            ...body,
            fullName,
            dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
            submittedFromPublic: true,
            isDetailsCompleted: statusData.isDetailsCompleted,
            status: statusData.status
        }
    });
};
exports.submitPublicStudent = submitPublicStudent;
