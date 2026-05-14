import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';
import { upload } from '../middlewares/upload.middleware';
import { saveFileAssetRecord } from '../services/file-storage.service';
import { apiResponse } from '../utils/ApiResponse';
import { UploadCategory } from '@prisma/client';

const router = Router();

router.post(
    '/schools/:schoolId/assets',
    requireAuth,
    allowRoles('SUPERADMIN', 'SCHOOL_STAFF'),
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'uniformBoy', maxCount: 1 },
        { name: 'uniformGirl', maxCount: 1 }
    ]),
    async (req, res, next) => {
        try {
            const files = req.files as Record<string, Express.Multer.File[]>;
            const data: any = {};

            if (files?.logo?.[0]) {
                const asset = await saveFileAssetRecord(files.logo[0], UploadCategory.SCHOOL_LOGO);
                data.logoFileId = asset.id;
            }
            if (files?.uniformBoy?.[0]) {
                const asset = await saveFileAssetRecord(files.uniformBoy[0], UploadCategory.SCHOOL_UNIFORM_BOY);
                data.uniformBoyFileId = asset.id;
            }
            if (files?.uniformGirl?.[0]) {
                const asset = await saveFileAssetRecord(files.uniformGirl[0], UploadCategory.SCHOOL_UNIFORM_GIRL);
                data.uniformGirlFileId = asset.id;
            }

            const school = await prisma.school.update({
                where: { id: req.params.schoolId },
                data,
                include: {
                    logoFile: true,
                    uniformBoyFile: true,
                    uniformGirlFile: true
                }
            });

            res.json(apiResponse('School assets uploaded', school));
        } catch (error) {
            next(error);
        }
    }
);

export default router;
