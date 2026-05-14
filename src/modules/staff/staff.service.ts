import { UserRole } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { hashValue } from '../../lib/bcrypt';

export const createStaff = async (schoolId: string, body: any) => {
    return prisma.user.create({
        data: {
            name: body.name,
            email: body.email,
            passwordHash: await hashValue(body.password),
            role: UserRole.SCHOOL_STAFF,
            schoolId
        }
    });
};

export const updateStaff = async (staffId: string, body: any) => {
    const data: any = {
        name: body.name,
        email: body.email,
        isActive: body.isActive
    };

    if (body.password) {
        data.passwordHash = await hashValue(body.password);
    }

    return prisma.user.update({
        where: { id: staffId },
        data
    });
};

export const listStaff = async (schoolId: string) => {
    return prisma.user.findMany({
        where: {
            schoolId,
            role: UserRole.SCHOOL_STAFF
        },
        orderBy: { createdAt: 'desc' }
    });
};
