"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSchoolSchema = exports.createSchoolSchema = void 0;
const zod_1 = require("zod");
const constants_1 = require("../../config/constants");
exports.createSchoolSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2),
        contactPerson: zod_1.z.string().min(2),
        email: zod_1.z.string().email(),
        phone: zod_1.z.string().min(8),
        address: zod_1.z.string().min(5),
        brandColor: zod_1.z.string().min(4),
        secondaryColor: zod_1.z.string().optional().nullable(),
        selectedTemplateId: zod_1.z.enum(constants_1.TEMPLATE_IDS),
        publicSlug: zod_1.z.string().optional(),
        isActive: zod_1.z.boolean().optional()
    })
});
exports.updateSchoolSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        contactPerson: zod_1.z.string().min(2).optional(),
        email: zod_1.z.string().email().optional(),
        phone: zod_1.z.string().min(8).optional(),
        address: zod_1.z.string().min(5).optional(),
        brandColor: zod_1.z.string().min(4).optional(),
        secondaryColor: zod_1.z.string().optional().nullable(),
        selectedTemplateId: zod_1.z.enum(constants_1.TEMPLATE_IDS).optional(),
        isActive: zod_1.z.boolean().optional()
    }),
    params: zod_1.z.object({
        schoolId: zod_1.z.string()
    })
});
