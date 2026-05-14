import { z } from 'zod';

export const exportPdfSchema = z.object({
    body: z.object({
        pageSize: z.enum(['A3', 'A4', 'A5']),
        studentIds: z.array(z.string()).optional(),
        filters: z.object({
            classValue: z.string().optional(),
            sectionValue: z.string().optional(),
            isDetailsCompleted: z.boolean().optional()
        }).optional()
    }),
    params: z.object({
        schoolId: z.string()
    })
});
