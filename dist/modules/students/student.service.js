"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadStudentPhoto = exports.listStudents = exports.updateStudent = exports.createStudent = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../lib/prisma");
const ApiError_1 = require("../../utils/ApiError");
const pagination_1 = require("../../utils/pagination");
const file_storage_service_1 = require("../../services/file-storage.service");
const image_composite_service_1 = require("../../services/image-composite.service");
const id_card_generator_service_1 = require("../../services/id-card-generator.service");
const computeStudentStatus = (studentLike) => {
    const requiredFields = [
        studentLike.firstName,
        studentLike.rollNumber,
        studentLike.gender,
        studentLike.classValue,
        studentLike.sectionValue,
        studentLike.photoFileId
    ];
    const allPresent = requiredFields.every(Boolean);
    if (!studentLike.photoFileId)
        return { isDetailsCompleted: false, status: client_1.StudentStatus.PHOTO_PENDING };
    if (!allPresent)
        return { isDetailsCompleted: false, status: client_1.StudentStatus.DETAILS_PENDING };
    return { isDetailsCompleted: true, status: client_1.StudentStatus.COMPLETED };
};
const createStudent = async (schoolId, body) => {
    const fullName = [body.firstName, body.lastName].filter(Boolean).join(' ').trim();
    const statusData = computeStudentStatus(body);
    return prisma_1.prisma.student.create({
        data: {
            schoolId,
            ...body,
            fullName,
            dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
            isDetailsCompleted: statusData.isDetailsCompleted,
            status: statusData.status
        }
    });
};
exports.createStudent = createStudent;
const updateStudent = async (schoolId, studentId, body) => {
    const student = await prisma_1.prisma.student.findFirst({ where: { id: studentId, schoolId } });
    if (!student)
        throw new ApiError_1.ApiError(404, 'Student not found');
    const merged = { ...student, ...body };
    const fullName = [merged.firstName, merged.lastName].filter(Boolean).join(' ').trim();
    const statusData = computeStudentStatus(merged);
    return prisma_1.prisma.student.update({
        where: { id: studentId },
        data: {
            ...body,
            fullName,
            dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
            isDetailsCompleted: statusData.isDetailsCompleted,
            status: statusData.status
        }
    });
};
exports.updateStudent = updateStudent;
const listStudents = async (schoolId, query) => {
    const { skip, take, page, limit } = (0, pagination_1.getPagination)(query.page, query.limit);
    const where = {
        schoolId,
        ...(query.classValue ? { classValue: query.classValue } : {}),
        ...(query.sectionValue ? { sectionValue: query.sectionValue } : {}),
        ...(query.isDetailsCompleted !== undefined
            ? { isDetailsCompleted: query.isDetailsCompleted === 'true' }
            : {}),
        ...(query.search
            ? {
                OR: [
                    { fullName: { contains: query.search, mode: 'insensitive' } },
                    { rollNumber: { contains: query.search, mode: 'insensitive' } },
                    { admissionNumber: { contains: query.search, mode: 'insensitive' } }
                ]
            }
            : {})
    };
    const [items, total] = await Promise.all([
        prisma_1.prisma.student.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            include: {
                photoFile: true,
                compositeFile: true,
                generatedCardFile: true,
                school: {
                    include: {
                        logoFile: true,
                        uniformBoyFile: true,
                        uniformGirlFile: true
                    }
                }
            }
        }),
        prisma_1.prisma.student.count({ where })
    ]);
    return {
        items,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};
exports.listStudents = listStudents;
const uploadStudentPhoto = async (schoolId, studentId, file) => {
    const student = await prisma_1.prisma.student.findFirst({
        where: { id: studentId, schoolId },
        include: {
            school: {
                include: {
                    logoFile: true,
                    uniformBoyFile: true,
                    uniformGirlFile: true
                }
            }
        }
    });
    if (!student)
        throw new ApiError_1.ApiError(404, 'Student not found');
    // 1. Persist the original photo file asset
    const photoAsset = await (0, file_storage_service_1.saveFileAssetRecord)(file, client_1.UploadCategory.STUDENT_PHOTO);
    // 2. Resolve the gender-appropriate uniform path
    const uniformPath = student.gender === 'MALE'
        ? student.school.uniformBoyFile?.path
        : student.gender === 'FEMALE'
            ? student.school.uniformGirlFile?.path
            : undefined;
    // 3. Generate smart composite: BG-removed face cropped onto uniform image
    const compositePath = await (0, image_composite_service_1.composeStudentUniformImage)({
        studentPhotoPath: file.path,
        uniformPath,
        outputFileName: `${student.id}-composite.png`
    });
    const compositePublicUrl = `/${compositePath.replace(/\\/g, '/')}`;
    const compositeAsset = await prisma_1.prisma.fileAsset.create({
        data: {
            originalName: `${student.fullName}-composite.png`,
            mimeType: 'image/png',
            extension: 'png',
            size: 0,
            path: compositePath,
            publicUrl: compositePublicUrl,
            category: client_1.UploadCategory.STUDENT_COMPOSITE
        }
    });
    // 4. Render the school's selected ID card template to a PNG screenshot
    let cardAsset = null;
    try {
        const cardResult = await (0, id_card_generator_service_1.generateStudentIdCard)({
            student: {
                ...student,
                compositeFile: { path: compositePath, publicUrl: compositePublicUrl },
                photoFile: { path: file.path, publicUrl: photoAsset.publicUrl }
            },
            school: student.school,
            outputFileName: `${student.id}-card.png`
        });
        cardAsset = await prisma_1.prisma.fileAsset.create({
            data: {
                originalName: `${student.fullName}-id-card.png`,
                mimeType: 'image/png',
                extension: 'png',
                size: cardResult.size,
                path: cardResult.path,
                publicUrl: cardResult.publicUrl,
                category: client_1.UploadCategory.STUDENT_ID_CARD
            }
        });
    }
    catch (err) {
        // Card generation is best-effort; photo upload must not fail because of it
        console.error('[uploadStudentPhoto] ID card generation failed:', err);
    }
    // 5. Compute new status and update student record
    const statusData = computeStudentStatus({ ...student, photoFileId: photoAsset.id });
    return prisma_1.prisma.student.update({
        where: { id: student.id },
        data: {
            photoFileId: photoAsset.id,
            compositeFileId: compositeAsset.id,
            generatedCardFileId: cardAsset?.id ?? undefined,
            isDetailsCompleted: statusData.isDetailsCompleted,
            status: statusData.status
        },
        include: {
            photoFile: true,
            compositeFile: true,
            generatedCardFile: true
        }
    });
};
exports.uploadStudentPhoto = uploadStudentPhoto;
