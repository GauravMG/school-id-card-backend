"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportPdfSchema = void 0;
const zod_1 = require("zod");
exports.exportPdfSchema = zod_1.z.object({
    body: zod_1.z.object({
        pageSize: zod_1.z.enum(['A3', 'A4', 'A5']),
        studentIds: zod_1.z.array(zod_1.z.string()).optional(),
        filters: zod_1.z.object({
            classValue: zod_1.z.string().optional(),
            sectionValue: zod_1.z.string().optional(),
            isDetailsCompleted: zod_1.z.boolean().optional()
        }).optional()
    }),
    params: zod_1.z.object({
        schoolId: zod_1.z.string()
    })
});
