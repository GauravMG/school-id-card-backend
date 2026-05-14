import { z } from 'zod';
import { MASTER_CLASSES, MASTER_SECTIONS } from '../../config/constants';

export const studentBaseSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().optional().nullable(),
    rollNumber: z.string().min(1),
    admissionNumber: z.string().optional().nullable(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    dateOfBirth: z.string().optional().nullable(),
    classValue: z.enum(MASTER_CLASSES as [string, ...string[]]),
    sectionValue: z.enum(MASTER_SECTIONS as [string, ...string[]]),
    fatherName: z.string().optional().nullable(),
    motherName: z.string().optional().nullable(),
    guardianPhone: z.string().optional().nullable(),
    emergencyPhone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    bloodGroup: z.string().optional().nullable(),
    transportRoute: z.string().optional().nullable()
});

export const createStudentSchema = z.object({
    body: studentBaseSchema,
    params: z.object({ schoolId: z.string() })
});

export const updateStudentSchema = z.object({
    body: studentBaseSchema.partial(),
    params: z.object({
        schoolId: z.string(),
        studentId: z.string()
    })
});

export const studentListQuerySchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        classValue: z.string().optional(),
        sectionValue: z.string().optional(),
        isDetailsCompleted: z.string().optional(),
        search: z.string().optional()
    })
});
