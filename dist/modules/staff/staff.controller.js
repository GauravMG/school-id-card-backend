"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listStaffController = exports.updateStaffController = exports.createStaffController = void 0;
const client_1 = require("@prisma/client");
const asyncHandler_1 = require("../../utils/asyncHandler");
const ApiResponse_1 = require("../../utils/ApiResponse");
const staff_service_1 = require("./staff.service");
const audit_log_service_1 = require("../../services/audit-log.service");
exports.createStaffController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const staff = await (0, staff_service_1.createStaff)(req.params.schoolId, req.body);
    await (0, audit_log_service_1.createAuditLog)({
        actorUserId: req.user?.userId,
        schoolId: req.params.schoolId,
        action: client_1.AuditAction.CREATE_STAFF,
        entityType: 'USER',
        entityId: staff.id,
        metadata: { email: staff.email },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    });
    res.status(201).json((0, ApiResponse_1.apiResponse)('Staff created', staff));
});
exports.updateStaffController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const staff = await (0, staff_service_1.updateStaff)(req.params.staffId, req.body);
    await (0, audit_log_service_1.createAuditLog)({
        actorUserId: req.user?.userId,
        schoolId: req.params.schoolId,
        action: client_1.AuditAction.UPDATE_STAFF,
        entityType: 'USER',
        entityId: staff.id,
        metadata: req.body,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    });
    res.json((0, ApiResponse_1.apiResponse)('Staff updated', staff));
});
exports.listStaffController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const list = await (0, staff_service_1.listStaff)(req.params.schoolId);
    res.json((0, ApiResponse_1.apiResponse)('Staff fetched', list));
});
