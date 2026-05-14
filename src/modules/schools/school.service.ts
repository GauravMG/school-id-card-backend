import { prisma } from '../../lib/prisma';
import { uniqueSlug } from '../../lib/slug';
import { ApiError } from '../../utils/ApiError';

export const createSchool = async (body: any) => {
    return prisma.school.create({
        data: {
            name: body.name,
            contactPerson: body.contactPerson,
            email: body.email,
            phone: body.phone,
            address: body.address,
            brandColor: body.brandColor,
            secondaryColor: body.secondaryColor || null,
            selectedTemplateId: body.selectedTemplateId,
            publicSlug: body.publicSlug || uniqueSlug(body.name),
            isActive: body.isActive ?? true
        }
    });
};

export const updateSchool = async (schoolId: string, body: any) => {
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) throw new ApiError(404, 'School not found');

    return prisma.school.update({
        where: { id: schoolId },
        data: body
    });
};

export const listSchools = async () => {
    return prisma.school.findMany({
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

export const getSchoolById = async (schoolId: string) => {
    const school = await prisma.school.findUnique({
        where: { id: schoolId },
        include: {
            logoFile: true,
            uniformBoyFile: true,
            uniformGirlFile: true,
            users: true
        }
    });
    if (!school) throw new ApiError(404, 'School not found');
    return school;
};
