import { Request, Response } from 'express';
import { AuditAction } from '@prisma/client';
import { asyncHandler } from '../../utils/asyncHandler';
import { apiResponse } from '../../utils/ApiResponse';
import { createStaff, listStaff, updateStaff } from './staff.service';
import { createAuditLog } from '../../services/audit-log.service';

export const createStaffController = asyncHandler(async (req: Request, res: Response) => {
    const staff = await createStaff(req.params.schoolId as string, req.body);

    await createAuditLog({
        actorUserId: req.user?.userId,
        schoolId: req.params.schoolId as string,
        action: AuditAction.CREATE_STAFF,
        entityType: 'USER',
        entityId: staff.id,
        metadata: { email: staff.email },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    });

    res.status(201).json(apiResponse('Staff created', staff));
});

export const updateStaffController = asyncHandler(async (req: Request, res: Response) => {
    const staff = await updateStaff(req.params.staffId as string, req.body);

    await createAuditLog({
        actorUserId: req.user?.userId,
        schoolId: req.params.schoolId as string,
        action: AuditAction.UPDATE_STAFF,
        entityType: 'USER',
        entityId: staff.id,
        metadata: req.body,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    });

    res.json(apiResponse('Staff updated', staff));
});

export const listStaffController = asyncHandler(async (req: Request, res: Response) => {
    const list = await listStaff(req.params.schoolId as string);
    res.json(apiResponse('Staff fetched', list));
});
