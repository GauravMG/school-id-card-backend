import { Request, Response } from 'express';
import { AuditAction } from '@prisma/client';
import { asyncHandler } from '../../utils/asyncHandler';
import { apiResponse } from '../../utils/ApiResponse';
import { findStudentByRollNumber, getPublicSchoolBySlug, submitPublicStudent } from './public.service';
import { createAuditLog } from '../../services/audit-log.service';
import { getSchoolFormFields } from '../schools/school-form-field.service';

export const getPublicSchoolController = asyncHandler(async (req: Request, res: Response) => {
    const school = await getPublicSchoolBySlug(req.params.slug);
    res.json(apiResponse('Public school fetched', school));
});

export const getPublicFormFieldsController = asyncHandler(async (req: Request, res: Response) => {
    const school = await getPublicSchoolBySlug(req.params.slug);
    const fields = await getSchoolFormFields(school.id);
    res.json(apiResponse('Public form fields fetched', fields));
});

export const getStudentByRollController = asyncHandler(async (req: Request, res: Response) => {
    const student = await findStudentByRollNumber(req.params.slug, String(req.query.rollNumber), String(req.query.classValue), String(req.query.sectionValue));
    res.json(apiResponse('Student fetched', student));
});

export const submitPublicStudentController = asyncHandler(async (req: Request, res: Response) => {
    const student = await submitPublicStudent(req.params.slug, req.body);

    await createAuditLog({
        schoolId: student.schoolId,
        action: AuditAction.PUBLIC_STUDENT_SUBMIT,
        entityType: 'STUDENT',
        entityId: student.id,
        metadata: { rollNumber: student.rollNumber },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    });

    res.json(apiResponse('Student details submitted', student));
});
