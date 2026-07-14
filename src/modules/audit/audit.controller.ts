import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { apiResponse } from '../../utils/ApiResponse';
import { listAuditActionTypes, listAuditLogs } from './audit.service';

export const listAuditLogsController = asyncHandler(async (req: Request, res: Response) => {
    const result = await listAuditLogs({
        schoolId: req.query.schoolId as string | undefined,
        action: req.query.action as string | undefined,
        entityType: req.query.entityType as string | undefined,
        actorEmail: req.query.actorEmail as string | undefined,
        portalType: req.query.portalType as 'SUPERADMIN' | 'SCHOOL' | undefined,
        dateFrom: req.query.dateFrom as string | undefined,
        dateTo: req.query.dateTo as string | undefined,
        page: req.query.page as string | undefined,
        limit: req.query.limit as string | undefined
    });
    res.json(apiResponse('Audit logs fetched', result));
});

export const listAuditActionTypesController = asyncHandler(async (_req: Request, res: Response) => {
    res.json(apiResponse('Audit action types fetched', listAuditActionTypes()));
});
