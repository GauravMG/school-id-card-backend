"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTemplatesController = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const ApiResponse_1 = require("../../utils/ApiResponse");
const template_service_1 = require("./template.service");
exports.listTemplatesController = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const templates = await (0, template_service_1.listTemplates)();
    res.json((0, ApiResponse_1.apiResponse)('Templates fetched', templates));
});
