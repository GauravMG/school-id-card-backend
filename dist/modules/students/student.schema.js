"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentListQuerySchema = exports.updateStudentSchema = exports.createStudentSchema = exports.studentBaseSchema = void 0;
const zod_1 = require("zod");
const constants_1 = require("../../config/constants");
exports.studentBaseSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().optional().nullable(),
    rollNumber: zod_1.z.string().min(1),
    admissionNumber: zod_1.z.string().optional().nullable(),
    gender: zod_1.z.enum(['MALE', 'FEMALE', 'OTHER']),
    dateOfBirth: zod_1.z.string().optional().nullable(),
    classValue: zod_1.z.enum(constants_1.MASTER_CLASSES),
    sectionValue: zod_1.z.enum(constants_1.MASTER_SECTIONS),
    fatherName: zod_1.z.string().optional().nullable(),
    motherName: zod_1.z.string().optional().nullable(),
    guardianPhone: zod_1.z.string().optional().nullable(),
    emergencyPhone: zod_1.z.string().optional().nullable(),
    address: zod_1.z.string().optional().nullable(),
    bloodGroup: zod_1.z.string().optional().nullable(),
    transportRoute: zod_1.z.string().optional().nullable(),
    stream: zod_1.z.enum(['ARTS', 'COMMERCE', 'SCIENCE_MEDICAL', 'SCIENCE_NON_MEDICAL']).optional().nullable(),
    commuteMode: zod_1.z.enum(['SELF', 'WITH_PARENT', 'SCHOOL_TRANSPORT']).optional().nullable()
});
const requireStreamForSeniorClasses = (data) => !['11', '12'].includes(data.classValue) || !!data.stream;
exports.createStudentSchema = zod_1.z.object({
    body: exports.studentBaseSchema.refine(requireStreamForSeniorClasses, {
        message: 'Stream is required for class 11 and 12',
        path: ['stream']
    }),
    params: zod_1.z.object({ schoolId: zod_1.z.string() })
});
exports.updateStudentSchema = zod_1.z.object({
    body: exports.studentBaseSchema.partial(),
    params: zod_1.z.object({
        schoolId: zod_1.z.string(),
        studentId: zod_1.z.string()
    })
});
exports.studentListQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
        classValue: zod_1.z.string().optional(),
        sectionValue: zod_1.z.string().optional(),
        isDetailsCompleted: zod_1.z.string().optional(),
        search: zod_1.z.string().optional()
    })
});
