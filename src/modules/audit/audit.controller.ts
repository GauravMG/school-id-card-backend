import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { apiResponse } from '../../utils/ApiResponse';
import { listAuditLogs } from './audit.service';

export const listAuditLogsController = asyncHandler(async (req: Request, res: Response) => {
    const logs = await listAuditLogs(req.query.schoolId as string | undefined);
    res.json(apiResponse('Audit logs fetched', logs));
});
