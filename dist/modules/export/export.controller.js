"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportSchoolPdfController = void 0;
const client_1 = require("@prisma/client");
const asyncHandler_1 = require("../../utils/asyncHandler");
const ApiResponse_1 = require("../../utils/ApiResponse");
const export_service_1 = require("./export.service");
const audit_log_service_1 = require("../../services/audit-log.service");
exports.exportSchoolPdfController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, export_service_1.exportSchoolStudentsPdf)(req.params.schoolId, req.body);
    await (0, audit_log_service_1.createAuditLog)({
        actorUserId: req.user?.userId,
        schoolId: req.params.schoolId,
        action: client_1.AuditAction.EXPORT_PDF,
        entityType: 'EXPORT',
        entityId: result.fileAsset.id,
        metadata: { pageSize: req.body.pageSize, count: result.count },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    });
    res.json((0, ApiResponse_1.apiResponse)('PDF exported', result));
});
