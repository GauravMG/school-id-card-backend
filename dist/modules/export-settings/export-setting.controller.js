"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExportSettingController = exports.updateExportSettingController = exports.createExportSettingController = exports.listActiveExportSettingsController = exports.listExportSettingsController = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const ApiResponse_1 = require("../../utils/ApiResponse");
const export_setting_service_1 = require("./export-setting.service");
exports.listExportSettingsController = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const settings = await (0, export_setting_service_1.listExportSettings)();
    res.json((0, ApiResponse_1.apiResponse)('Export settings fetched', settings));
});
exports.listActiveExportSettingsController = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const settings = await (0, export_setting_service_1.listActiveExportSettings)();
    res.json((0, ApiResponse_1.apiResponse)('Active export settings fetched', settings));
});
exports.createExportSettingController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { pageSize, cardsPerPage } = req.body;
    const setting = await (0, export_setting_service_1.createExportSetting)({ pageSize, cardsPerPage });
    res.status(201).json((0, ApiResponse_1.apiResponse)('Export setting created', setting));
});
exports.updateExportSettingController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { cardsPerPage, isActive } = req.body;
    const setting = await (0, export_setting_service_1.updateExportSetting)(id, { cardsPerPage, isActive });
    res.json((0, ApiResponse_1.apiResponse)('Export setting updated', setting));
});
exports.deleteExportSettingController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await (0, export_setting_service_1.deleteExportSetting)(id);
    res.json((0, ApiResponse_1.apiResponse)('Export setting deleted', null));
});
