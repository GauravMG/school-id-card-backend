"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStaffSchema = exports.createStaffSchema = void 0;
const zod_1 = require("zod");
exports.createStaffSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(6)
    }),
    params: zod_1.z.object({
        schoolId: zod_1.z.string()
    })
});
exports.updateStaffSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        email: zod_1.z.string().email().optional(),
        password: zod_1.z.string().min(6).optional(),
        isActive: zod_1.z.boolean().optional()
    }),
    params: zod_1.z.object({
        schoolId: zod_1.z.string(),
        staffId: zod_1.z.string()
    })
});
