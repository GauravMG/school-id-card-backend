import { Request, Response } from 'express';
import { AuditAction } from '@prisma/client';
import { asyncHandler } from '../../utils/asyncHandler';
import { apiResponse } from '../../utils/ApiResponse';
import { createSchool, getSchoolById, listSchools, updateSchool } from './school.service';
import { createAuditLog } from '../../services/audit-log.service';
import { getSchoolFontMap, updateSchoolFontMap } from './school-font.service';
import { FONT_CATALOG } from '../../services/font-catalog';
import { getSchoolFormFields, updateSchoolFormFields } from './school-form-field.service';

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
    const school = await updateSchool(req.params.schoolId as string, req.body);

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
    const school = await getSchoolById(req.params.schoolId as string);
    res.json(apiResponse('School fetched', school));
});

export const getSchoolFontsController = asyncHandler(async (req: Request, res: Response) => {
    const fonts = await getSchoolFontMap(req.params.schoolId as string);
    res.json(apiResponse('School fonts fetched', { fonts, catalog: FONT_CATALOG }));
});

export const updateSchoolFontsController = asyncHandler(async (req: Request, res: Response) => {
    const fonts = await updateSchoolFontMap(req.params.schoolId as string, req.body);

    await createAuditLog({
        actorUserId: req.user?.userId,
        schoolId: req.params.schoolId as string,
        action: AuditAction.UPDATE_SCHOOL,
        entityType: 'SCHOOL_FONTS',
        entityId: req.params.schoolId as string,
        metadata: req.body,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    });

    res.json(apiResponse('School fonts updated', fonts));
});

export const getSchoolFormFieldsController = asyncHandler(async (req: Request, res: Response) => {
    const fields = await getSchoolFormFields(req.params.schoolId as string);
    res.json(apiResponse('School form fields fetched', fields));
});

export const updateSchoolFormFieldsController = asyncHandler(async (req: Request, res: Response) => {
    const fields = await updateSchoolFormFields(req.params.schoolId as string, req.body.fields || []);

    await createAuditLog({
        actorUserId: req.user?.userId,
        schoolId: req.params.schoolId as string,
        action: AuditAction.UPDATE_SCHOOL,
        entityType: 'SCHOOL_FORM_FIELDS',
        entityId: req.params.schoolId as string,
        metadata: req.body,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    });

    res.json(apiResponse('School form fields updated', fields));
});
