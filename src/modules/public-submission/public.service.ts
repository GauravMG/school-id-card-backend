import { StudentStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';

const computeStatus = (data: any) => {
    const ok = !!(data.firstName && data.rollNumber && data.gender && data.classValue && data.sectionValue && data.photoFileId);
    if (ok) return { status: StudentStatus.COMPLETED, isDetailsCompleted: true };
    if (!data.photoFileId) return { status: StudentStatus.PHOTO_PENDING, isDetailsCompleted: false };
    return { status: StudentStatus.DETAILS_PENDING, isDetailsCompleted: false };
};

export const getPublicSchoolBySlug = async (slug: string) => {
    const school = await prisma.school.findUnique({
        where: { publicSlug: slug },
        include: { logoFile: true, uniformBoyFile: true, uniformGirlFile: true }
    });
    if (!school || !school.isActive) throw new ApiError(404, 'School not found');
    return school;
};

export const findStudentByRollNumber = async (slug: string, rollNumber: string, classValue: string, sectionValue: string) => {
    const school = await getPublicSchoolBySlug(slug);

    return prisma.student.findFirst({
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

export const submitPublicStudent = async (slug: string, body: any) => {
    const school = await getPublicSchoolBySlug(slug);
    const fullName = [body.firstName, body.lastName].filter(Boolean).join(' ').trim();

    const existing = await prisma.student.findUnique({
        where: {
            schoolId_rollNumber: {
                schoolId: school.id,
                rollNumber: body.rollNumber
            }
        }
    });

    const statusData = computeStatus(body);

    if (!existing) {
        return prisma.student.create({
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

    return prisma.student.update({
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
