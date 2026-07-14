import { z } from 'zod';
import { studentBaseSchema } from '../students/student.schema';

export const submitPublicStudentSchema = z.object({
    body: studentBaseSchema.refine(
        (data) => !['11', '12'].includes(data.classValue) || !!data.stream,
        { message: 'Stream is required for class 11 and 12', path: ['stream'] }
    )
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
