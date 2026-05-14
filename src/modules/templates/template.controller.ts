import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { apiResponse } from '../../utils/ApiResponse';
import { listTemplates } from './template.service';

export const listTemplatesController = asyncHandler(async (_req: Request, res: Response) => {
    const templates = await listTemplates();
    res.json(apiResponse('Templates fetched', templates));
});
