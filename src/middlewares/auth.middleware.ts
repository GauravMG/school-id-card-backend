import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../lib/jwt';
import { ApiError } from '../utils/ApiError';

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return next(new ApiError(401, 'Unauthorized'));
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
};
