import { AnyZodObject } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: AnyZodObject) => (req: Request, _res: Response, next: NextFunction) => {
    schema.parse({
        body: req.body,
        params: req.params,
        query: req.query
    });
    next();
};
