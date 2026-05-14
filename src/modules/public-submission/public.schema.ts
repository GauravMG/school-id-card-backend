import { z } from 'zod';
import { studentBaseSchema } from '../students/student.schema';

export const submitPublicStudentSchema = z.object({
    body: studentBaseSchema
});

export const getByRollSchema = z.object({
    query: z.object({
        rollNumber: z.string().min(1),
        classValue: z.string().min(1),
        sectionValue: z.string().min(1),
    }),
    params: z.object({
        slug: z.string().min(1)
    })
});
