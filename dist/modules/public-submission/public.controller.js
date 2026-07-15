"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitPublicStudentController = exports.getStudentByRollController = exports.getPublicSchoolController = void 0;
const client_1 = require("@prisma/client");
const asyncHandler_1 = require("../../utils/asyncHandler");
const ApiResponse_1 = require("../../utils/ApiResponse");
const public_service_1 = require("./public.service");
const audit_log_service_1 = require("../../services/audit-log.service");
exports.getPublicSchoolController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const school = await (0, public_service_1.getPublicSchoolBySlug)(req.params.slug);
    res.json((0, ApiResponse_1.apiResponse)('Public school fetched', school));
});
exports.getStudentByRollController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const student = await (0, public_service_1.findStudentByRollNumber)(req.params.slug, String(req.query.rollNumber), String(req.query.classValue), String(req.query.sectionValue));
    res.json((0, ApiResponse_1.apiResponse)('Student fetched', student));
});
exports.submitPublicStudentController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const student = await (0, public_service_1.submitPublicStudent)(req.params.slug, req.body);
    await (0, audit_log_service_1.createAuditLog)({
        schoolId: student.schoolId,
        action: client_1.AuditAction.PUBLIC_STUDENT_SUBMIT,
        entityType: 'STUDENT',
        entityId: student.id,
        metadata: { rollNumber: student.rollNumber },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    });
    res.json((0, ApiResponse_1.apiResponse)('Student details submitted', student));
});
