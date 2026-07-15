import { Request, Response } from 'express';
import { AuditAction } from '@prisma/client';
import { asyncHandler } from '../../utils/asyncHandler';
import { apiResponse } from '../../utils/ApiResponse';
import { createStudent, getStudentPhotoStatus, listStudents, updateStudent, uploadStudentPhoto } from './student.service';
import { createAuditLog } from '../../services/audit-log.service';
import { importStudentsFromCsv } from '../../services/csv-import.service';
import { importBulkPhotos } from '../../services/bulk-photo-import.service';
import { ApiError } from '../../utils/ApiError';

export const createStudentController = asyncHandler(async (req: Request, res: Response) => {
    const student = await createStudent(req.params.schoolId as string, req.body);

    await createAuditLog({
        actorUserId: req.user?.userId,
        schoolId: req.params.schoolId as string,
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
    const student = await updateStudent(req.params.schoolId as string, req.params.studentId as string, req.body);

    await createAuditLog({
        actorUserId: req.user?.userId,
        schoolId: req.params.schoolId as string,
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
            : req.params.schoolId as string;

    const result = await listStudents(effectiveSchoolId!, req.query);
    res.json(apiResponse('Students fetched', result));
});

export const uploadStudentPhotoController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new ApiError(400, 'Photo file is required');

    const student = await uploadStudentPhoto(req.params.schoolId as string, req.params.studentId as string, req.file);

    await createAuditLog({
        actorUserId: req.user?.userId,
        schoolId: req.params.schoolId as string,
        action: AuditAction.STUDENT_PHOTO_UPLOAD,
        entityType: 'STUDENT',
        entityId: student.id,
        metadata: { file: req.file.originalname },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    });

    res.json(apiResponse('Student photo uploaded', student));
});

export const getStudentPhotoStatusController = asyncHandler(async (req: Request, res: Response) => {
    const status = await getStudentPhotoStatus(req.params.schoolId as string, req.params.studentId as string);
    res.json(apiResponse('Student photo status fetched', status));
});

export const importStudentsCsvController = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new ApiError(400, 'CSV file is required');

    const students = await importStudentsFromCsv(req.params.schoolId as string, req.file.path);

    await createAuditLog({
        actorUserId: req.user?.userId,
        schoolId: req.params.schoolId as string,
        action: AuditAction.CSV_IMPORT,
        entityType: 'STUDENT',
        metadata: { count: students.length, file: req.file.originalname },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    });

    res.json(apiResponse('Students imported', { count: students.length, students }));
});

export const bulkPhotoImportController = asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const sheetFile = files?.sheet?.[0];
    const photoFiles = files?.photos || [];

    if (!sheetFile) throw new ApiError(400, 'Roster sheet (CSV or Excel) is required');
    if (photoFiles.length === 0) throw new ApiError(400, 'At least one photo file is required');

    const result = await importBulkPhotos(req.params.schoolId as string, sheetFile.path, photoFiles);

    await createAuditLog({
        actorUserId: req.user?.userId,
        schoolId: req.params.schoolId as string,
        action: AuditAction.CSV_IMPORT,
        entityType: 'STUDENT',
        metadata: {
            source: 'bulk-photo-import',
            sheet: sheetFile.originalname,
            photosUploaded: photoFiles.length,
            matched: result.matched.length,
            unmatchedPhoto: result.unmatchedPhoto.length,
            invalidRows: result.invalidRows.length
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    });

    res.json(apiResponse('Bulk photo import processed', result));
});
