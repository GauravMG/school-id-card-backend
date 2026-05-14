import { z } from 'zod';

export const createStaffSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6)
    }),
    params: z.object({
        schoolId: z.string()
    })
});

export const updateStaffSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
        password: z.string().min(6).optional(),
        isActive: z.boolean().optional()
    }),
    params: z.object({
        schoolId: z.string(),
        staffId: z.string()
    })
});
