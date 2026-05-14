import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';

export const allowRoles = (...roles: Array<'SUPERADMIN' | 'SCHOOL_STAFF'>) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new ApiError(403, 'Forbidden'));
        }
        next();
    };
};
