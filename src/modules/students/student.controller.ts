import { Request, Response } from 'express';
import { AuditAction } from '@prisma/client';
import { asyncHandler } from '../../utils/asyncHandler';
import { apiResponse } from '../../utils/ApiResponse';
import { createStudent, listStudents, updateStudent, uploadStudentPhoto } from './student.service';
import { createAuditLog } from '../../services/audit-log.service';
import { importStudentsFromCsv } from '../../services/csv-import.service';
import { ApiError } from '../../utils/ApiError';

export const createStudentController = asyncHandler(async (req: Request, res: Response) => {
    const student = await createStudent(req.params.schoolId, req.body);

    await createAuditLog({
        actorUserId: req.user?.userId,
        schoolId: req.params.schoolId,
        action: AuditAction.CREATE_STUDENT,
        entityType: 'STUDENT',
        entityId: student.id,
        metadata: req.body,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    });

    res.status(201).json(apiResponse('Student created', student));
});

export const updateStudentController = asyncHandler(async (req: Request, res: Response) => {
    const student = await updateStudent(req.params.schoolId, req.params.studentId, req.body);

    await createAuditLog({
        actorUserId: req.user?.userId,
        schoolId: req.params.schoolId,
        action: AuditAction.UPDATE_STUDENT,
        entityType: 'STUDENT',
        entityId: student.id,
        metadata: req.body,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    });

    res.json(apiResponse('Student updated', student));
});

export const listStudentsController = asyncHandler(async (req: Request, res: Response) => {
    const effectiveSchoolId =
        req.user?.actingAsSchoolId
            ? req.user.actingAsSchoolId
            : req.params.schoolId;

    const result = await listStudents(effectiveSchoolId!, req.query);
    res.json(apiResponse('Students fetched', result));
});

export const uploadStudentPhotoController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new ApiError(400, 'Photo file is required');

    const student = await uploadStudentPhoto(req.params.schoolId, req.params.studentId, req.file);

    await createAuditLog({
        actorUserId: req.user?.userId,
        schoolId: req.params.schoolId,
        action: AuditAction.STUDENT_PHOTO_UPLOAD,
        entityType: 'STUDENT',
        entityId: student.id,
        metadata: { file: req.file.originalname },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    });

    res.json(apiResponse('Student photo uploaded', student));
});

export const importStudentsCsvController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new ApiError(400, 'CSV file is required');

    const students = await importStudentsFromCsv(req.params.schoolId, req.file.path);

    await createAuditLog({
        actorUserId: req.user?.userId,
        schoolId: req.params.schoolId,
        action: AuditAction.CSV_IMPORT,
        entityType: 'STUDENT',
        metadata: { count: students.length, file: req.file.originalname },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    });

    res.json(apiResponse('Students imported', { count: students.length, students }));
});
