"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAuditLogsController = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const ApiResponse_1 = require("../../utils/ApiResponse");
const audit_service_1 = require("./audit.service");
exports.listAuditLogsController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const logs = await (0, audit_service_1.listAuditLogs)(req.query.schoolId);
    res.json((0, ApiResponse_1.apiResponse)('Audit logs fetched', logs));
});
