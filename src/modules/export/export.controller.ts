import { Request, Response } from 'express';
import { AuditAction } from '@prisma/client';
import { asyncHandler } from '../../utils/asyncHandler';
import { apiResponse } from '../../utils/ApiResponse';
import { exportSchoolStudentsPdf } from './export.service';
import { createAuditLog } from '../../services/audit-log.service';

export const exportSchoolPdfController = asyncHandler(async (req: Request, res: Response) => {
    const result = await exportSchoolStudentsPdf(req.params.schoolId as string, req.body);

    await createAuditLog({
        actorUserId: req.user?.userId,
        schoolId: req.params.schoolId as string,
        action: AuditAction.EXPORT_PDF,
        entityType: 'EXPORT',
        entityId: result.fileAsset.id,
        metadata: { pageSize: req.body.pageSize, count: result.count },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    });

    res.json(apiResponse('PDF exported', result));
});
