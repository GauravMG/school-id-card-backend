"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSchoolController = exports.listSchoolsController = exports.updateSchoolController = exports.createSchoolController = void 0;
const client_1 = require("@prisma/client");
const asyncHandler_1 = require("../../utils/asyncHandler");
const ApiResponse_1 = require("../../utils/ApiResponse");
const school_service_1 = require("./school.service");
const audit_log_service_1 = require("../../services/audit-log.service");
exports.createSchoolController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const school = await (0, school_service_1.createSchool)(req.body);
    await (0, audit_log_service_1.createAuditLog)({
        actorUserId: req.user?.userId,
        schoolId: school.id,
        action: client_1.AuditAction.CREATE_SCHOOL,
        entityType: 'SCHOOL',
        entityId: school.id,
        metadata: req.body,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    });
    res.status(201).json((0, ApiResponse_1.apiResponse)('School created', school));
});
exports.updateSchoolController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const school = await (0, school_service_1.updateSchool)(req.params.schoolId, req.body);
    await (0, audit_log_service_1.createAuditLog)({
        actorUserId: req.user?.userId,
        schoolId: school.id,
        action: client_1.AuditAction.UPDATE_SCHOOL,
        entityType: 'SCHOOL',
        entityId: school.id,
        metadata: req.body,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    });
    res.json((0, ApiResponse_1.apiResponse)('School updated', school));
});
exports.listSchoolsController = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const schools = await (0, school_service_1.listSchools)();
    res.json((0, ApiResponse_1.apiResponse)('Schools fetched', schools));
});
exports.getSchoolController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const school = await (0, school_service_1.getSchoolById)(req.params.schoolId);
    res.json((0, ApiResponse_1.apiResponse)('School fetched', school));
});
