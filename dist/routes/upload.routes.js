"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const file_storage_service_1 = require("../services/file-storage.service");
const ApiResponse_1 = require("../utils/ApiResponse");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.post('/schools/:schoolId/assets', auth_middleware_1.requireAuth, (0, role_middleware_1.allowRoles)('SUPERADMIN', 'SCHOOL_STAFF'), upload_middleware_1.upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'uniformBoy', maxCount: 1 },
    { name: 'uniformGirl', maxCount: 1 }
]), async (req, res, next) => {
    try {
        const files = req.files;
        const data = {};
        if (files?.logo?.[0]) {
            const asset = await (0, file_storage_service_1.saveFileAssetRecord)(files.logo[0], client_1.UploadCategory.SCHOOL_LOGO);
            data.logoFileId = asset.id;
        }
        if (files?.uniformBoy?.[0]) {
            const asset = await (0, file_storage_service_1.saveFileAssetRecord)(files.uniformBoy[0], client_1.UploadCategory.SCHOOL_UNIFORM_BOY);
            data.uniformBoyFileId = asset.id;
        }
        if (files?.uniformGirl?.[0]) {
            const asset = await (0, file_storage_service_1.saveFileAssetRecord)(files.uniformGirl[0], client_1.UploadCategory.SCHOOL_UNIFORM_GIRL);
            data.uniformGirlFileId = asset.id;
        }
        const school = await prisma_1.prisma.school.update({
            where: { id: req.params.schoolId },
            data,
            include: {
                logoFile: true,
                uniformBoyFile: true,
                uniformGirlFile: true
            }
        });
        res.json((0, ApiResponse_1.apiResponse)('School assets uploaded', school));
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
