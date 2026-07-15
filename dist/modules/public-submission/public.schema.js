"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getByRollSchema = exports.submitPublicStudentSchema = void 0;
const zod_1 = require("zod");
const student_schema_1 = require("../students/student.schema");
exports.submitPublicStudentSchema = zod_1.z.object({
    body: student_schema_1.studentBaseSchema.refine((data) => !['11', '12'].includes(data.classValue) || !!data.stream, { message: 'Stream is required for class 11 and 12', path: ['stream'] })
});
exports.getByRollSchema = zod_1.z.object({
    query: zod_1.z.object({
        rollNumber: zod_1.z.string().min(1),
        classValue: zod_1.z.string().min(1),
        sectionValue: zod_1.z.string().min(1),
    }),
    params: zod_1.z.object({
        slug: zod_1.z.string().min(1)
    })
});
