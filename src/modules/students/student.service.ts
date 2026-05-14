import { Prisma, StudentStatus, UploadCategory } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';
import { getPagination } from '../../utils/pagination';
import { saveFileAssetRecord } from '../../services/file-storage.service';
import { composeStudentUniformImage } from '../../services/image-composite.service';
import { generateStudentIdCard } from '../../services/id-card-generator.service';

const computeStudentStatus = (studentLike: any): { isDetailsCompleted: boolean; status: StudentStatus } => {
    const requiredFields = [
        studentLike.firstName,
        studentLike.rollNumber,
        studentLike.gender,
        studentLike.classValue,
        studentLike.sectionValue,
        studentLike.photoFileId
    ];

    const allPresent = requiredFields.every(Boolean);

    if (!studentLike.photoFileId) return { isDetailsCompleted: false, status: StudentStatus.PHOTO_PENDING };
    if (!allPresent) return { isDetailsCompleted: false, status: StudentStatus.DETAILS_PENDING };
    return { isDetailsCompleted: true, status: StudentStatus.COMPLETED };
};

export const createStudent = async (schoolId: string, body: any) => {
    const fullName = [body.firstName, body.lastName].filter(Boolean).join(' ').trim();
    const statusData = computeStudentStatus(body);

    return prisma.student.create({
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

export const updateStudent = async (schoolId: string, studentId: string, body: any) => {
    const student = await prisma.student.findFirst({ where: { id: studentId, schoolId } });
    if (!student) throw new ApiError(404, 'Student not found');

    const merged = { ...student, ...body };
    const fullName = [merged.firstName, merged.lastName].filter(Boolean).join(' ').trim();
    const statusData = computeStudentStatus(merged);

    return prisma.student.update({
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

export const listStudents = async (schoolId: string, query: any) => {
    const { skip, take, page, limit } = getPagination(query.page, query.limit);

    const where: Prisma.StudentWhereInput = {
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
        prisma.student.findMany({
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
        prisma.student.count({ where })
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

export const uploadStudentPhoto = async (schoolId: string, studentId: string, file: Express.Multer.File) => {
    const student = await prisma.student.findFirst({
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

    if (!student) throw new ApiError(404, 'Student not found');

    // 1. Persist the original photo file asset
    const photoAsset = await saveFileAssetRecord(file, UploadCategory.STUDENT_PHOTO);

    // 2. Resolve the gender-appropriate uniform path
    const uniformPath =
        student.gender === 'MALE'
            ? student.school.uniformBoyFile?.path
            : student.gender === 'FEMALE'
                ? student.school.uniformGirlFile?.path
                : undefined;

    // 3. Generate smart composite: BG-removed face cropped onto uniform image
    const compositePath = await composeStudentUniformImage({
        studentPhotoPath: file.path,
        uniformPath,
        outputFileName: `${student.id}-composite.png`
    });

    const compositePublicUrl = `/${compositePath.replace(/\\/g, '/')}`;

    const compositeAsset = await prisma.fileAsset.create({
        data: {
            originalName: `${student.fullName}-composite.png`,
            mimeType: 'image/png',
            extension: 'png',
            size: 0,
            path: compositePath,
            publicUrl: compositePublicUrl,
            category: UploadCategory.STUDENT_COMPOSITE
        }
    });

    // 4. Render the school's selected ID card template to a PNG screenshot
    let cardAsset: Awaited<ReturnType<typeof prisma.fileAsset.create>> | null = null;
    try {
        const cardResult = await generateStudentIdCard({
            student: {
                ...student,
                compositeFile: { path: compositePath, publicUrl: compositePublicUrl },
                photoFile: { path: file.path, publicUrl: photoAsset.publicUrl }
            },
            school: student.school,
            outputFileName: `${student.id}-card.png`
        });

        cardAsset = await prisma.fileAsset.create({
            data: {
                originalName: `${student.fullName}-id-card.png`,
                mimeType: 'image/png',
                extension: 'png',
                size: cardResult.size,
                path: cardResult.path,
                publicUrl: cardResult.publicUrl,
                category: UploadCategory.STUDENT_ID_CARD
            }
        });
    } catch (err) {
        // Card generation is best-effort; photo upload must not fail because of it
        console.error('[uploadStudentPhoto] ID card generation failed:', err);
    }

    // 5. Compute new status and update student record
    const statusData = computeStudentStatus({ ...student, photoFileId: photoAsset.id });

    return prisma.student.update({
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
