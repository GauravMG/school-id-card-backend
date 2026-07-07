import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { apiResponse } from '../../utils/ApiResponse';
import {
    listExportSettings,
    listActiveExportSettings,
    getExportSetting,
    createExportSetting,
    updateExportSetting,
    deleteExportSetting
} from './export-setting.service';

export const listExportSettingsController = asyncHandler(async (_req: Request, res: Response) => {
    const settings = await listExportSettings();
    res.json(apiResponse('Export settings fetched', settings));
});

export const listActiveExportSettingsController = asyncHandler(async (_req: Request, res: Response) => {
    const settings = await listActiveExportSettings();
    res.json(apiResponse('Active export settings fetched', settings));
});

export const createExportSettingController = asyncHandler(async (req: Request, res: Response) => {
    const { pageSize, cardsPerPage } = req.body;
    const setting = await createExportSetting({ pageSize, cardsPerPage });
    res.status(201).json(apiResponse('Export setting created', setting));
});

export const updateExportSettingController = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { cardsPerPage, isActive, showCropMarks } = req.body;
    const setting = await updateExportSetting(id, { cardsPerPage, isActive, showCropMarks });
    res.json(apiResponse('Export setting updated', setting));
});

export const deleteExportSettingController = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await deleteExportSetting(id);
    res.json(apiResponse('Export setting deleted', null));
});
