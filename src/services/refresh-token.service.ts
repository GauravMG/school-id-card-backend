import crypto from 'crypto';
import dayjs from 'dayjs';
import { prisma } from '../lib/prisma';

export const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

export const storeRefreshToken = async (userId: string, rawToken: string, expiresInDays = 7) => {
    return prisma.refreshToken.create({
        data: {
            userId,
            tokenHash: sha256(rawToken),
            expiresAt: dayjs().add(expiresInDays, 'day').toDate()
        }
    });
};

export const findActiveRefreshToken = async (rawToken: string) => {
    return prisma.refreshToken.findUnique({
        where: { tokenHash: sha256(rawToken) },
        include: { user: true }
    });
};

export const revokeRefreshToken = async (rawToken: string) => {
    const tokenHash = sha256(rawToken);
    return prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { status: 'REVOKED' }
    });
};
