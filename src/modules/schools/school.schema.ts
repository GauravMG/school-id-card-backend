import { z } from 'zod';
import { TEMPLATE_IDS } from '../../config/constants';

export const createSchoolSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        contactPerson: z.string().min(2),
        email: z.string().email(),
        phone: z.string().min(8),
        address: z.string().min(5),
        brandColor: z.string().min(4),
        secondaryColor: z.string().optional().nullable(),
        selectedTemplateId: z.enum(TEMPLATE_IDS as [string, ...string[]]),
        publicSlug: z.string().optional(),
        isActive: z.boolean().optional()
    })
});

export const updateSchoolSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        contactPerson: z.string().min(2).optional(),
        email: z.string().email().optional(),
        phone: z.string().min(8).optional(),
        address: z.string().min(5).optional(),
        brandColor: z.string().min(4).optional(),
        secondaryColor: z.string().optional().nullable(),
        selectedTemplateId: z.enum(TEMPLATE_IDS as [string, ...string[]]).optional(),
        isActive: z.boolean().optional()
    }),
    params: z.object({
        schoolId: z.string()
    })
});
