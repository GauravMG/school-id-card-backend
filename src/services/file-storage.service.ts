import fs from 'fs';
import path from 'path';
import { prisma } from '../lib/prisma';
import { UploadCategory } from '@prisma/client';

export const saveFileAssetRecord = async (file: Express.Multer.File, category: UploadCategory) => {
    const publicPath = file.path.replace(/\\/g, '/');
    return prisma.fileAsset.create({
        data: {
            originalName: file.originalname,
            mimeType: file.mimetype,
            extension: path.extname(file.originalname).replace('.', ''),
            size: file.size,
            path: publicPath,
            publicUrl: `/${publicPath}`,
            category
        }
    });
};

export const moveFile = (source: string, target: string) => {
    fs.renameSync(source, target);
    return target;
};
