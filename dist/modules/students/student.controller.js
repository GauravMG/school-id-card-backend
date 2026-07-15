"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importStudentsCsvController = exports.uploadStudentPhotoController = exports.listStudentsController = exports.updateStudentController = exports.createStudentController = void 0;
const client_1 = require("@prisma/client");
const asyncHandler_1 = require("../../utils/asyncHandler");
const ApiResponse_1 = require("../../utils/ApiResponse");
const student_service_1 = require("./student.service");
const audit_log_service_1 = require("../../services/audit-log.service");
const csv_import_service_1 = require("../../services/csv-import.service");
const ApiError_1 = require("../../utils/ApiError");
exports.createStudentController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const student = await (0, student_service_1.createStudent)(req.params.schoolId, req.body);
    await (0, audit_log_service_1.createAuditLog)({
        actorUserId: req.user?.userId,
        schoolId: req.params.schoolId,
        action: client_1.AuditAction.CREATE_STUDENT,
        entityType: 'STUDENT',
        entityId: student.id,
        metadata: req.body,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    });
    res.status(201).json((0, ApiResponse_1.apiResponse)('Student created', student));
});
exports.updateStudentController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const student = await (0, student_service_1.updateStudent)(req.params.schoolId, req.params.studentId, req.body);
    await (0, audit_log_service_1.createAuditLog)({
        actorUserId: req.user?.userId,
        schoolId: req.params.schoolId,
        action: client_1.AuditAction.UPDATE_STUDENT,
        entityType: 'STUDENT',
        entityId: student.id,
        metadata: req.body,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    });
    res.json((0, ApiResponse_1.apiResponse)('Student updated', student));
});
exports.listStudentsController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const effectiveSchoolId = req.user?.actingAsSchoolId
        ? req.user.actingAsSchoolId
        : req.params.schoolId;
    const result = await (0, student_service_1.listStudents)(effectiveSchoolId, req.query);
    res.json((0, ApiResponse_1.apiResponse)('Students fetched', result));
});
exports.uploadStudentPhotoController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file)
        throw new ApiError_1.ApiError(400, 'Photo file is required');
    const student = await (0, student_service_1.uploadStudentPhoto)(req.params.schoolId, req.params.studentId, req.file);
    await (0, audit_log_service_1.createAuditLog)({
        actorUserId: req.user?.userId,
        schoolId: req.params.schoolId,
        action: client_1.AuditAction.STUDENT_PHOTO_UPLOAD,
        entityType: 'STUDENT',
        entityId: student.id,
        metadata: { file: req.file.originalname },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    });
    res.json((0, ApiResponse_1.apiResponse)('Student photo uploaded', student));
});
exports.importStudentsCsvController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file)
        throw new ApiError_1.ApiError(400, 'CSV file is required');
    const students = await (0, csv_import_service_1.importStudentsFromCsv)(req.params.schoolId, req.file.path);
    await (0, audit_log_service_1.createAuditLog)({
        actorUserId: req.user?.userId,
        schoolId: req.params.schoolId,
        action: client_1.AuditAction.CSV_IMPORT,
        entityType: 'STUDENT',
        metadata: { count: students.length, file: req.file.originalname },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    });
    res.json((0, ApiResponse_1.apiResponse)('Students imported', { count: students.length, students }));
});
