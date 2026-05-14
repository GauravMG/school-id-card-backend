import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';

export const errorMiddleware = (err: Error | ApiError, _req: Request, res: Response, _next: NextFunction) => {
    const statusCode = err instanceof ApiError ? err.statusCode : 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({
        success: false,
        message,
        details: err instanceof ApiError ? err.details : undefined
    });
};
