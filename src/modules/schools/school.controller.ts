import { Request, Response } from 'express';
import { AuditAction } from '@prisma/client';
import { asyncHandler } from '../../utils/asyncHandler';
import { apiResponse } from '../../utils/ApiResponse';
import { createSchool, getSchoolById, listSchools, updateSchool } from './school.service';
import { createAuditLog } from '../../services/audit-log.service';

export const createSchoolController = asyncHandler(async (req: Request, res: Response) => {
    const school = await createSchool(req.body);

    await createAuditLog({
        actorUserId: req.user?.userId,
        schoolId: school.id,
        action: AuditAction.CREATE_SCHOOL,
        entityType: 'SCHOOL',
        entityId: school.id,
        metadata: req.body,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    });

    res.status(201).json(apiResponse('School created', school));
});

export const updateSchoolController = asyncHandler(async (req: Request, res: Response) => {
    const school = await updateSchool(req.params.schoolId, req.body);

    await createAuditLog({
        actorUserId: req.user?.userId,
        schoolId: school.id,
        action: AuditAction.UPDATE_SCHOOL,
        entityType: 'SCHOOL',
        entityId: school.id,
        metadata: req.body,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    });

    res.json(apiResponse('School updated', school));
});

export const listSchoolsController = asyncHandler(async (_req: Request, res: Response) => {
    const schools = await listSchools();
    res.json(apiResponse('Schools fetched', schools));
});

export const getSchoolController = asyncHandler(async (req: Request, res: Response) => {
    const school = await getSchoolById(req.params.schoolId);
    res.json(apiResponse('School fetched', school));
});
