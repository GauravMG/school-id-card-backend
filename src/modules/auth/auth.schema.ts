import { z } from 'zod';

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(6)
    })
});

export const loginAsSchema = z.object({
    body: z.object({
        schoolId: z.string().min(1)
    })
});
